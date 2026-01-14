package com.jobpazar.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseFixer implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            System.out.println("Applying Database Fixes...");
            // Fix: Convert 'status' column in 'jobs' table to VARCHAR to avoid ENUM
            // truncation issues
            // This is safe even if it's already VARCHAR.
            String sql = "ALTER TABLE jobs MODIFY COLUMN status VARCHAR(50)";
            jdbcTemplate.execute(sql);
            System.out.println("Database Fix Applied: jobs.status converted to VARCHAR(50).");
        } catch (Exception e) {
            System.out.println("Database Fix Skipped or Failed (might already be fixed): " + e.getMessage());
        }
    }
}
