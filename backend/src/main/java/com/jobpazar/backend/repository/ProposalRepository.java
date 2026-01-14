package com.jobpazar.backend.repository;

import com.jobpazar.backend.entity.Proposal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProposalRepository extends JpaRepository<Proposal, Long> {
    List<Proposal> findAllByJobId(Long jobId);

    List<Proposal> findAllByFreelancerId(Long freelancerId);

    List<Proposal> findByJobIdAndFreelancerId(Long jobId, Long freelancerId);
}
