# All imports at the top
import os
from dotenv import load_dotenv
load_dotenv()
import requests
from vanna import Agent
from vanna.core.registry import ToolRegistry
from vanna.core.user import UserResolver, User, RequestContext
from vanna.tools import RunSqlTool, VisualizeDataTool
from vanna.tools.agent_memory import SaveQuestionToolArgsTool, SearchSavedCorrectToolUsesTool, SaveTextMemoryTool
from vanna.servers.fastapi import VannaFastAPIServer
from vanna.integrations.ollama import OllamaLlmService
from vanna.integrations.postgres import PostgresRunner
from vanna.integrations.pinecone.agent_memory import PineconeAgentMemory
from vanna.core.llm import LlmService

# Configure your LLM
class GroqLlmService(LlmService):
    def __init__(self, api_key, model="mixtral-8x7b-32768", endpoint="https://api.groq.com/openai/v1/chat/completions"):
        self.api_key = api_key
        self.model = model
        self.endpoint = endpoint

    def complete(self, prompt, **kwargs):
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.2
        }
        response = requests.post(self.endpoint, headers=headers, json=data)
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]

    def send_request(self, prompt, **kwargs):
        return self.complete(prompt, **kwargs)

    def stream_request(self, prompt, **kwargs):
        # For simplicity, just yield the complete response
        yield self.complete(prompt, **kwargs)

    def validate_tools(self, tools):
        # Accept all tools for now
        return True

llm = GroqLlmService(api_key=os.getenv("GROQ_API_KEY"))

connection_string=f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
# Configure your database
db_tool = RunSqlTool(
    sql_runner=PostgresRunner(
        connection_string=connection_string
    )
)

# Configure your agent memory
agent_memory = PineconeAgentMemory(
    api_key=os.getenv("PINECONE_API_KEY"),
    environment="us-west1-gcp",
    index_name="vanna-memory"
)

# Configure user authentication
class SimpleUserResolver(UserResolver):
    async def resolve_user(self, request_context: RequestContext) -> User:
        user_email = request_context.get_cookie('vanna_email') or 'guest@example.com'
        group = 'admin' if user_email == 'admin@example.com' else 'user'
        return User(id=user_email, email=user_email, group_memberships=[group])

user_resolver = SimpleUserResolver()

# Create your agent
tools = ToolRegistry()
tools.register_local_tool(db_tool, access_groups=['admin', 'user'])
tools.register_local_tool(SaveQuestionToolArgsTool(), access_groups=['admin'])
tools.register_local_tool(SearchSavedCorrectToolUsesTool(), access_groups=['admin', 'user'])
tools.register_local_tool(SaveTextMemoryTool(), access_groups=['admin', 'user'])
tools.register_local_tool(VisualizeDataTool(), access_groups=['admin', 'user'])

agent = Agent(
    llm_service=llm,
    tool_registry=tools,
    user_resolver=user_resolver,
    agent_memory=agent_memory
)

# running the server exposes the /vanna/query as a POST endpoint
server = VannaFastAPIServer(agent)
server.run()