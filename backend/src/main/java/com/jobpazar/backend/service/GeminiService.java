package com.jobpazar.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @SuppressWarnings("unchecked")
    public String generateContent(String prompt) {
        try {
            String url = apiUrl + apiKey;

            // Request Body
            Map<String, Object> part = new HashMap<>();
            part.put("text", prompt);

            Map<String, Object> content = new HashMap<>();
            content.put("parts", Collections.singletonList(part));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", Collections.singletonList(content));

            // Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            // Call API
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    request,
                    new ParameterizedTypeReference<Map<String, Object>>() {
                    });

            // Parse Response (Safely)
            if (response.getBody() == null)
                throw new RuntimeException("No response from AI.");

            Map<String, Object> body = response.getBody();
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");

            if (candidates == null || candidates.isEmpty())
                throw new RuntimeException("No candidates returned.");

            Map<String, Object> firstCandidate = candidates.get(0);

            if (!firstCandidate.containsKey("content") || firstCandidate.get("content") == null) {
                // Check for safety block or other finish reasons
                String finishReason = (String) firstCandidate.get("finishReason");
                if (finishReason != null) {
                    throw new RuntimeException("AI Generation Failed. Finish Reason: " + finishReason);
                }
                throw new RuntimeException("AI returned no content.");
            }

            Map<String, Object> contentPart = (Map<String, Object>) firstCandidate.get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) contentPart.get("parts");

            if (parts == null || parts.isEmpty())
                throw new RuntimeException("No content parts.");

            return (String) parts.get(0).get("text");

        } catch (org.springframework.web.client.HttpClientErrorException e) {
            // Capture 429 or others and rethrow as ResponseStatusException to preserve
            // status code
            throw new org.springframework.web.server.ResponseStatusException(e.getStatusCode(),
                    "AI Provider Error: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("AI Service Error: " + e.getMessage());
        }
    }
}
