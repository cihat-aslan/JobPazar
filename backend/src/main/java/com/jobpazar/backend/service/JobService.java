package com.jobpazar.backend.service;

import com.jobpazar.backend.entity.Job;
import com.jobpazar.backend.entity.JobStatus;
import com.jobpazar.backend.entity.User;
import com.jobpazar.backend.repository.JobRepository;
import com.jobpazar.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    public Job createJob(Job job, Long employerId) {
        User employer = userRepository.findById(employerId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        job.setEmployer(employer);
        job.setStatus(JobStatus.OPEN);
        return jobRepository.save(job);
    }

    public List<Job> getAllOpenJobs() {
        return jobRepository.findAllByStatus(JobStatus.OPEN);
    }

    public List<Job> getMyJobs(Long userId) {
        return jobRepository.findAllByEmployerId(userId);
    }

    public Job updateJob(Long jobId, Job jobDetails) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        job.setTitle(jobDetails.getTitle());
        job.setDescription(jobDetails.getDescription());
        job.setBudget(jobDetails.getBudget());
        job.setCategory(jobDetails.getCategory());
        job.setDuration(jobDetails.getDuration());
        // We can allow status updates too if needed, but keeping it simple for now

        return jobRepository.save(job);
    }

    public Job getJobById(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
    }

    public void deleteJob(Long id) {
        jobRepository.deleteById(id);
    }
}
