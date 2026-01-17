package com.jobpazar.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.HashMap;
import java.util.Map;

@Service
public class ConsoleMailService implements IMailService {

    private final WebClient webClient;

    public ConsoleMailService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
                .baseUrl("http://127.0.0.1:8000")
                .build();
    }

    @Override
    public void sendEmail(String to, String subject, String body) {
        System.out.println("================ MAIL SERVICE ================");
        System.out.println("TO: " + to);
        System.out.println("SUBJECT: " + subject);
        System.out.println("BODY: " + body);
        System.out.println("==============================================");

        // Python servisine mail gönder
        try {
            Map<String, String> mailData = new HashMap<>();
            mailData.put("email", to);
            mailData.put("subject", subject);
            mailData.put("body", body);

            webClient.post()
                    .uri("/send-mail")
                    .bodyValue(mailData)
                    .retrieve()
                    .bodyToMono(String.class)
                    .doOnSuccess(res -> System.out.println("MAIL OK: " + res))
                    .doOnError(err -> System.err.println("MAIL ERROR: " + err.getMessage()))
                    .subscribe();
        } catch (Exception e) {
            System.err.println("MAIL EXCEPTION: " + e.getMessage());
        }
    }
}
