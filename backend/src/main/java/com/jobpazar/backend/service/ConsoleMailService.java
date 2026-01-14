package com.jobpazar.backend.service;

import org.springframework.stereotype.Service;

@Service
public class ConsoleMailService implements IMailService {

    @Override
    public void sendEmail(String to, String subject, String body) {
        System.out.println("================ MAIL SERVICE (MOCK) ================");
        System.out.println("TO: " + to);
        System.out.println("SUBJECT: " + subject);
        System.out.println("BODY: " + body);
        System.out.println("=====================================================");
    }
}
