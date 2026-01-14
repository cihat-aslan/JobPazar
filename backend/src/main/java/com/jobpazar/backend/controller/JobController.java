package com.jobpazar.backend.controller;

import com.jobpazar.backend.entity.Job;
import com.jobpazar.backend.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    @Autowired
    private JobService jobService;

    // Create a new job
    @PostMapping
    public ResponseEntity<?> createJob(@RequestBody Job job, @RequestParam Long employerId) {
        try {
            Job createdJob = jobService.createJob(job, employerId);
            return ResponseEntity.ok(createdJob);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // List all OPEN jobs
    @GetMapping
    public ResponseEntity<List<Job>> getAllOpenJobs() {
        return ResponseEntity.ok(jobService.getAllOpenJobs());
    }

    // List my jobs (for Employer)
    @GetMapping("/my-jobs")
    public ResponseEntity<List<Job>> getMyJobs(@RequestParam Long userId) {
        return ResponseEntity.ok(jobService.getMyJobs(userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateJob(@PathVariable Long id, @RequestBody Job jobDetails) {
        try {
            Job updatedJob = jobService.updateJob(id, jobDetails);
            return ResponseEntity.ok(updatedJob);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Job> getJobById(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable Long id) {
        try {
            jobService.deleteJob(id);
            return ResponseEntity.ok("Job deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
