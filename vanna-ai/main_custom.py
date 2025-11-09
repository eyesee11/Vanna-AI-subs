# Custom FastAPI server for Vanna AI with Groq integration
# This bypasses VannaFastAPIServer and creates custom endpoints

import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import requests
import psycopg2
from psycopg2.extras import RealDictCursor
import uvicorn

# FastAPI app
app = FastAPI(title="Vanna AI Custom Server")

# CORS middleware
allowed_origins = [
    "http://localhost:3000",  # Local development (Next.js)
    "http://localhost:3001",  # Local development (Express API)
]

# Add production URLs from environment variables
if os.getenv("FRONTEND_URL"):
    allowed_origins.append(os.getenv("FRONTEND_URL"))
if os.getenv("BACKEND_URL"):
    allowed_origins.append(os.getenv("BACKEND_URL"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if os.getenv("NODE_ENV") != "development" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection configuration
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", "5432")),
    "database": os.getenv("DB_NAME", "buchhaltung"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", "yourpassword")
}

# Groq API configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "your-groq-api-key")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")  # Updated to valid Groq model
GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"

# Database schema for context
DATABASE_SCHEMA = """
Database Schema (PostgreSQL with camelCase columns):

Table: vendors
- id (uuid, primary key)
- name (text)
- email (text, nullable)
- phone (text, nullable)
- address (text, nullable)
- taxId (text, nullable)
- createdAt (timestamp)
- updatedAt (timestamp)

Table: customers
- id (uuid, primary key)
- name (text)
- email (text, nullable)
- phone (text, nullable)
- address (text, nullable)
- taxId (text, nullable)
- createdAt (timestamp)
- updatedAt (timestamp)

Table: invoices
- id (uuid, primary key)
- invoiceNumber (text, unique)
- vendorId (uuid, foreign key -> vendors.id)
- customerId (uuid, foreign key -> customers.id, nullable)
- invoiceDate (timestamp)
- dueDate (timestamp, nullable)
- subtotal (float)
- taxAmount (float)
- totalAmount (float)
- status (text: 'paid', 'pending', 'overdue')
- currency (text, default 'EUR')
- paymentTerms (text, nullable)
- category (text, nullable)
- description (text, nullable)
- createdAt (timestamp)
- updatedAt (timestamp)

Table: line_items
- id (uuid, primary key)
- invoiceId (uuid, foreign key -> invoices.id)
- description (text)
- quantity (float)
- unitPrice (float)
- amount (float)
- taxRate (float, nullable)
- createdAt (timestamp)

Table: payments
- id (uuid, primary key)
- invoiceId (uuid, foreign key -> invoices.id)
- amount (float)
- paymentDate (timestamp)
- paymentMethod (text, nullable)
- reference (text, nullable)
- notes (text, nullable)
- createdAt (timestamp)

IMPORTANT: All column names use camelCase (e.g., totalAmount, invoiceDate, vendorId).
Do NOT use snake_case (e.g., total_amount, invoice_date, vendor_id).
"""

# Request/Response models
class QueryRequest(BaseModel):
    question: str

class QueryResponse(BaseModel):
    question: str
    sql: str
    results: list
    error: Optional[str] = None

# Helper function: Fix SQL column names
def fix_column_names(sql: str) -> str:
    """
    Convert snake_case column names to camelCase AND add quotes for case-sensitivity
    PostgreSQL requires quotes around mixed-case identifiers
    """
    import re
    
    print(f"🔧 Original SQL: {sql}")
    
    # Map of snake_case to camelCase
    replacements = {
        'total_amount': 'totalAmount',
        'tax_amount': 'taxAmount',
        'invoice_date': 'invoiceDate',
        'due_date': 'dueDate',
        'invoice_number': 'invoiceNumber',
        'vendor_id': 'vendorId',
        'customer_id': 'customerId',
        'payment_terms': 'paymentTerms',
        'created_at': 'createdAt',
        'updated_at': 'updatedAt',
        'invoice_id': 'invoiceId',
        'unit_price': 'unitPrice',
        'tax_rate': 'taxRate',
        'tax_id': 'taxId',
        'payment_date': 'paymentDate',
        'payment_method': 'paymentMethod',
    }
    
    fixed_sql = sql
    
    # Replace snake_case with camelCase
    for snake, camel in replacements.items():
        fixed_sql = re.sub(r'\b' + snake + r'\b', camel, fixed_sql, flags=re.IGNORECASE)
    
    print(f"🔧 After snake_case fix: {fixed_sql}")
    
    # Now quote all camelCase column names
    camel_columns = [
        'totalAmount', 'taxAmount', 'invoiceDate', 'dueDate', 'invoiceNumber',
        'vendorId', 'customerId', 'paymentTerms', 'createdAt', 'updatedAt',
        'invoiceId', 'unitPrice', 'taxRate', 'taxId', 'paymentDate', 'paymentMethod',
        'subtotal', 'quantity', 'amount', 'description', 'reference', 'notes', 'status',
        'currency', 'category', 'name', 'email', 'phone', 'address'
    ]
    
    # Quote each column name found in the SQL
    for col in camel_columns:
        # Pattern: match column name with optional table alias (e.g., i.totalAmount or totalAmount)
        pattern = r'(\b\w+\.)?' + re.escape(col) + r'\b'
        
        def replacer(match):
            prefix = match.group(1) if match.group(1) else ''
            return f'{prefix}"{col}"'
        
        fixed_sql = re.sub(pattern, replacer, fixed_sql)
    
    print(f"🔧 After quoting: {fixed_sql}")
    
    return fixed_sql

# Helper function: Connect to database
def get_db_connection():
    """Create a connection to PostgreSQL database"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")

# Helper function: Generate SQL using Groq
def generate_sql_with_groq(question: str) -> str:
    """
    Use Groq LLM to convert natural language question to SQL
    
    Args:
        question: Natural language question about the database
    
    Returns:
        Generated SQL query string
    """
    prompt = f"""You are a SQL expert. Convert the following natural language question into a PostgreSQL query.

{DATABASE_SCHEMA}

Question: {question}

CRITICAL Rules:
1. Return ONLY the SQL query, no explanation or markdown
2. Use camelCase for ALL column names: totalAmount (NOT total_amount), invoiceDate (NOT invoice_date), vendorId (NOT vendor_id)
3. Use proper PostgreSQL syntax
4. Use table aliases for clarity (e.g., i for invoices, v for vendors)
5. Join tables when needed
6. Limit results to 100 rows unless specified otherwise
7. Use aggregate functions when appropriate (SUM, COUNT, AVG, etc.)
8. For date filtering, use CURRENT_DATE and INTERVAL

Example - Correct camelCase:
SELECT SUM(i.totalAmount) FROM invoices i WHERE i.invoiceDate >= CURRENT_DATE - INTERVAL '30 days';

Example - WRONG snake_case (DO NOT USE):
SELECT SUM(i.total_amount) FROM invoices i WHERE i.invoice_date >= CURRENT_DATE - INTERVAL '30 days';

SQL Query:"""

    try:
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        data = {
            "model": GROQ_MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0,  # Zero temperature for consistent SQL generation
            "max_tokens": 500
        }
        
        response = requests.post(GROQ_ENDPOINT, headers=headers, json=data, timeout=30)
        response.raise_for_status()
        
        sql = response.json()["choices"][0]["message"]["content"].strip()
        
        # Clean up SQL (remove markdown code blocks if present)
        sql = sql.replace("```sql", "").replace("```", "").strip()
        
        print(f"🔧 BEFORE fix: {sql}")
        
        # Fix column names (convert snake_case to camelCase AND add quotes)
        sql = fix_column_names(sql)
        
        print(f"🔧 AFTER fix: {sql}")
        
        return sql
    except requests.exceptions.HTTPError as e:
        # Log detailed error from Groq API
        error_detail = f"Groq API error: {e}"
        try:
            error_body = e.response.json()
            error_detail = f"Groq API error: {error_body}"
        except:
            error_detail = f"Groq API error: {e.response.text}"
        print(f"❌ {error_detail}")
        raise HTTPException(status_code=500, detail=error_detail)
    except Exception as e:
        print(f"❌ SQL generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"SQL generation failed: {str(e)}")

# Helper function: Execute SQL query
def execute_sql(sql: str) -> list:
    """
    Execute SQL query and return results
    
    Args:
        sql: SQL query string
    
    Returns:
        List of dictionaries with query results
    """
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(sql)
        
        # Check if query returns results (SELECT) or just executes (INSERT/UPDATE/DELETE)
        if cursor.description:
            results = cursor.fetchall()
            # Convert to list of dicts
            return [dict(row) for row in results]
        else:
            conn.commit()
            return [{"message": "Query executed successfully", "rows_affected": cursor.rowcount}]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SQL execution failed: {str(e)}")
    finally:
        if conn:
            conn.close()

# Routes

@app.get("/")
def root():
    """Root endpoint with API information"""
    return {
        "name": "Vanna AI Custom Server",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "query": "/query (POST)"
        }
    }

@app.get("/health")
def health():
    """Health check endpoint"""
    try:
        # Test database connection
        conn = get_db_connection()
        conn.close()
        return {
            "status": "healthy",
            "database": "connected",
            "groq_api_key": "configured" if GROQ_API_KEY != "your-groq-api-key" else "not configured"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }

@app.post("/query", response_model=QueryResponse)
def query(request: QueryRequest):
    """
    Main query endpoint - converts natural language to SQL and executes it
    
    Request body:
        {
            "question": "What is the total spend in the last 30 days?"
        }
    
    Response:
        {
            "question": "...",
            "sql": "SELECT ...",
            "results": [...],
            "error": null
        }
    """
    try:
        # Step 1: Generate SQL from question using Groq
        sql = generate_sql_with_groq(request.question)
        print(f"🔍 Generated SQL: {sql}")
        
        # Step 2: Execute SQL query
        results = execute_sql(sql)
        
        return QueryResponse(
            question=request.question,
            sql=sql,
            results=results,
            error=None
        )
    except HTTPException as e:
        print(f"❌ HTTPException: {e.detail}")
        return QueryResponse(
            question=request.question,
            sql="",
            results=[],
            error=e.detail
        )
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
        return QueryResponse(
            question=request.question,
            sql="",
            results=[],
            error=str(e)
        )

@app.get("/schema")
def get_schema():
    """Return database schema information"""
    return {
        "schema": DATABASE_SCHEMA,
        "tables": ["vendors", "customers", "invoices", "line_items", "payments"]
    }

# Run server
if __name__ == "__main__":
    print("\n🚀 Starting Custom Vanna AI Server...")
    print(f"📊 Database: {DB_CONFIG['database']} at {DB_CONFIG['host']}:{DB_CONFIG['port']}")
    print(f"🤖 LLM: Groq ({GROQ_MODEL})")
    print(f"🌐 Server: http://localhost:8000")
    print(f"📖 Docs: http://localhost:8000/docs")
    print("\nEndpoints:")
    print("  GET  /health - Health check")
    print("  POST /query  - Natural language queries")
    print("  GET  /schema - Database schema\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
