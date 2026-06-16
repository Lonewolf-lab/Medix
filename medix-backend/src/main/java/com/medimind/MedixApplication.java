package com.medimind;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MedixApplication {

    public static void main(String[] args) {
        SpringApplication.run(MedixApplication.class, args);
    }
}
