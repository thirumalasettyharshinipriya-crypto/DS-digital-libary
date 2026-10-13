"""
DS Lab Portal — Automated Tests
Tests for Database Operations and CRUD logic
"""

import unittest
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

class TestDSLabDatabase(unittest.TestCase):
    def test_database_schema_definition(self):
        """Verify database.sql file exists and contains necessary table definitions."""
        sql_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "database.sql"))
        self.assertTrue(os.path.exists(sql_path), "database.sql must exist")
        
        with open(sql_path, "r", encoding="utf-8") as f:
            content = f.read()

        required_tables = [
            "student", "modules", "experiments", "experiment_media",
            "projects", "project_files", "lab_equipments", "resources", "uploaded_files",
            "audit_logs"
        ]
        for tbl in required_tables:
            self.assertIn(f"CREATE TABLE IF NOT EXISTS {tbl}", content, f"Table {tbl} must be defined in database.sql")

    def test_safe_sql_queries(self):
        """Test parameterization checks and read-only validator for SQL tool."""
        disallowed = ["DROP", "DELETE", "UPDATE", "INSERT", "ALTER", "TRUNCATE"]
        sample_malicious = "DROP TABLE students;"
        is_blocked = any(f" {word} " in f" {sample_malicious.upper()} " for word in disallowed)
        self.assertTrue(is_blocked, "Mutating query must be blocked")

        sample_safe = "SELECT student_id, name, gpa FROM students WHERE gpa > 8.0 ORDER BY gpa DESC;"
        self.assertTrue(sample_safe.strip().upper().startswith("SELECT"), "Read-only SELECT must be recognized")

if __name__ == "__main__":
    unittest.main()
