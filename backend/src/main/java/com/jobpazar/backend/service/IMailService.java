package com.jobpazar.backend.service;

public interface IMailService {
    void sendEmail(String to, String subject, String body);
}
