package com.jobpazar.backend.repository;

import com.jobpazar.backend.entity.Job;
import com.jobpazar.backend.entity.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findAllByStatus(JobStatus status);

    List<Job> findAllByEmployerId(Long employerId);
}
