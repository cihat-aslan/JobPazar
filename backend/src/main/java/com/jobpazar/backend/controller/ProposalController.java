package com.jobpazar.backend.controller;

import com.jobpazar.backend.entity.Proposal;
import com.jobpazar.backend.service.ProposalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/proposals")
public class ProposalController {

    @Autowired
    private ProposalService proposalService;

    // Submit a proposal for a job
    @PostMapping("/{jobId}")
    public ResponseEntity<?> submitProposal(@PathVariable Long jobId,
            @RequestBody Proposal proposal,
            @RequestParam Long freelancerId) {
        try {
            Proposal savedProposal = proposalService.submitProposal(proposal, jobId, freelancerId);
            return ResponseEntity.ok(savedProposal);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // List proposals for a specific job
    @GetMapping("/{jobId}")
    public ResponseEntity<List<Proposal>> getProposals(@PathVariable Long jobId) {
        return ResponseEntity.ok(proposalService.getProposalsForJob(jobId));
    }

    // List my proposals
    @GetMapping("/my-proposals")
    public ResponseEntity<List<Proposal>> getMyProposals(@RequestParam Long freelancerId) {
        return ResponseEntity.ok(proposalService.getProposalsForFreelancer(freelancerId));
    }

    @GetMapping("/my-proposal")
    public ResponseEntity<Proposal> getMyProposalForJob(@RequestParam Long jobId, @RequestParam Long freelancerId) {
        return proposalService.getProposalByJobAndFreelancer(jobId, freelancerId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    // Accept a proposal
    @PutMapping("/{proposalId}/accept")
    public ResponseEntity<?> acceptProposal(@PathVariable Long proposalId) {
        try {
            proposalService.acceptProposal(proposalId);
            return ResponseEntity.ok("Proposal accepted successfully. Job is now IN_PROGRESS.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{proposalId}/reject")
    public ResponseEntity<?> rejectProposal(@PathVariable Long proposalId) {
        try {
            proposalService.rejectProposal(proposalId);
            return ResponseEntity.ok("Proposal rejected.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
