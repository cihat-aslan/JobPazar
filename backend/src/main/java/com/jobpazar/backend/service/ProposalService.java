package com.jobpazar.backend.service;

import com.jobpazar.backend.entity.Job;
import com.jobpazar.backend.entity.JobStatus;
import com.jobpazar.backend.entity.Proposal;
import com.jobpazar.backend.entity.ProposalStatus;
import com.jobpazar.backend.entity.User;
import com.jobpazar.backend.repository.JobRepository;
import com.jobpazar.backend.repository.ProposalRepository;
import com.jobpazar.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProposalService {

    @Autowired
    private ProposalRepository proposalRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private IMailService mailService;

    public Proposal submitProposal(Proposal proposal, Long jobId, Long freelancerId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (job.getStatus() != JobStatus.OPEN) {
            throw new RuntimeException("Job is not open for proposals");
        }

        User freelancer = userRepository.findById(freelancerId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!isPriceWithinBudget(proposal.getPrice(), job.getBudget())) {
            throw new RuntimeException("Teklifiniz, ilan sahibinin belirlediği bütçe aralığına uygun değil.");
        }

        // Check for existing proposal
        List<Proposal> existingList = proposalRepository.findByJobIdAndFreelancerId(jobId, freelancerId);
        if (!existingList.isEmpty()) {
            Proposal p = existingList.get(0);
            p.setPrice(proposal.getPrice());
            p.setCoverLetter(proposal.getCoverLetter());
            p.setDaysToDeliver(proposal.getDaysToDeliver());
            p.setStatus(ProposalStatus.PENDING); // Reset to PENDING if updated? Or keep status? Usually reset if
                                                 // re-negotiating.
            return proposalRepository.save(p);
        }

        proposal.setJob(job);
        proposal.setFreelancer(freelancer);
        proposal.setStatus(ProposalStatus.PENDING);

        return proposalRepository.save(proposal);
    }

    public List<Proposal> getProposalsForJob(Long jobId) {
        return proposalRepository.findAllByJobId(jobId);
    }

    public List<Proposal> getProposalsForFreelancer(Long freelancerId) {
        return proposalRepository.findAllByFreelancerId(freelancerId);
    }

    public java.util.Optional<Proposal> getProposalByJobAndFreelancer(Long jobId, Long freelancerId) {
        List<Proposal> list = proposalRepository.findByJobIdAndFreelancerId(jobId, freelancerId);
        return list.isEmpty() ? java.util.Optional.empty() : java.util.Optional.of(list.get(0));
    }

    @Transactional
    public void acceptProposal(Long proposalId) {
        Proposal proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new RuntimeException("Proposal not found"));

        Job job = proposal.getJob();

        // 1. Update Proposal Status
        proposal.setStatus(ProposalStatus.ACCEPTED);
        proposalRepository.save(proposal);

        // 2. Update Job Status
        job.setStatus(JobStatus.IN_PROGRESS);
        job.setStartedAt(java.time.LocalDateTime.now());
        jobRepository.save(job);

        // 3. Reject other proposals
        List<Proposal> otherProposals = proposalRepository.findAllByJobId(job.getId());
        for (Proposal p : otherProposals) {
            if (!p.getId().equals(proposalId)) {
                p.setStatus(ProposalStatus.REJECTED);
                proposalRepository.save(p);
            }
        }

        // 4. Send Notification
        String to = proposal.getFreelancer().getEmail();
        String subject = "Tebrikler! Teklifiniz Kabul Edildi";
        String body = "Merhaba " + proposal.getFreelancer().getUsername() + ",\n\n" +
                "'" + job.getTitle() + "' başlıklı ilan için verdiğiniz teklif işveren tarafından kabul edildi.\n" +
                "İş durumu: " + job.getStatus();

        mailService.sendEmail(to, subject, body);
    }

    private boolean isPriceWithinBudget(Double price, String budget) {
        if (price == null || budget == null)
            return true;

        // English keys mapping (Frontend should send these)
        switch (budget) {
            case "Very Low":
            case "Çok Düşük":
                return price > 0 && price <= 1000;
            case "Low":
            case "Düşük":
                return price > 1000 && price <= 5000;
            case "Medium":
            case "Orta":
                return price > 5000 && price <= 15000;
            case "High":
            case "Yüksek":
                return price > 15000 && price < 50000;
            case "Very High":
            case "Çok Yüksek":
                return price >= 50000;
            default:
                return true;
        }
    }

    @Transactional
    public void rejectProposal(Long proposalId) {
        Proposal proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new RuntimeException("Proposal not found"));

        proposal.setStatus(ProposalStatus.REJECTED);
        proposalRepository.save(proposal);

        // Send Notification
        String to = proposal.getFreelancer().getEmail();
        String subject = "Teklifiniz ile ilgili güncelleme";
        String body = "Merhaba " + proposal.getFreelancer().getUsername() + ",\n\n" +
                "'" + proposal.getJob().getTitle()
                + "' başlıklı ilan için verdiğiniz teklif ne yazık ki kabul edilmedi.";

        mailService.sendEmail(to, subject, body);
    }
}
