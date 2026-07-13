package com.diksha.leavemanagementsystem.service.impl;

import com.diksha.leavemanagementsystem.event.EmployeeRegisteredEvent;
import com.diksha.leavemanagementsystem.event.LeaveAppliedEvent;
import com.diksha.leavemanagementsystem.event.LeaveApprovedEvent;
import com.diksha.leavemanagementsystem.event.LeaveRejectedEvent;
import com.diksha.leavemanagementsystem.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.ITemplateEngine;
import org.thymeleaf.context.Context;

import java.nio.charset.StandardCharsets;

/**
 * Default {@link EmailService} implementation.
 * <p>
 * Every public method is {@code @Async}: it is fired off to the dedicated
 * "emailTaskExecutor" thread pool (see {@link com.diksha.leavemanagementsystem.config.AsyncConfig})
 * and returns immediately, so leave/registration workflows are never
 * delayed or blocked by SMTP latency.
 * <p>
 * Every send is wrapped in try/catch: a failed email (bad credentials,
 * SMTP timeout, invalid address, etc.) is logged and swallowed here so it
 * can never affect a business operation that already completed
 * successfully before the notification was triggered.
 * <p>
 * Templates are rendered using Spring Boot's autoconfigured Thymeleaf
 * {@link ITemplateEngine} (via {@code spring-boot-starter-thymeleaf}),
 * which uses Spring's {@code SpringStandardDialect} (SpringEL) rather than
 * the OGNL-based {@code StandardDialect} used by a manually constructed
 * {@code org.thymeleaf.TemplateEngine} — deliberately avoided here since
 * OGNL is not on the classpath in a Spring Boot application.
 */
@Service
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final ITemplateEngine templateEngine;

    @Value("${app.mail.from}")
    private String fromAddress;

    @Value("${app.mail.enabled:true}")
    private boolean mailEnabled;

    @Value("${frontend.url}")
    private String frontendUrl;

    public EmailServiceImpl(JavaMailSender mailSender, ITemplateEngine templateEngine) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendWelcomeEmail(EmployeeRegisteredEvent event) {
        Context context = new Context();
        context.setVariable("employeeName", event.getEmployeeName());
        context.setVariable("username", event.getUsername());
        context.setVariable("companyName", event.getCompanyName());
        context.setVariable("department", event.getDepartment());
        context.setVariable("designation", event.getDesignation());
        context.setVariable("role", event.getRole());
        context.setVariable("loginUrl", frontendUrl + "/login");

        dispatch(
                event.getEmployeeEmail(),
                "Welcome to LeaveFlow, " + event.getEmployeeName() + "!",
                "email/welcome-email",
                context
        );
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendLeaveAppliedEmail(LeaveAppliedEvent event) {
        Context context = new Context();
        context.setVariable("managerName", event.getManagerName());
        context.setVariable("employeeName", event.getEmployeeName());
        context.setVariable("leaveType", formatEnum(event.getLeaveType()));
        context.setVariable("startDate", event.getStartDate());
        context.setVariable("endDate", event.getEndDate());
        context.setVariable("totalDays", event.getTotalDays());
        context.setVariable("reason", event.getReason());
        context.setVariable("appliedOn", event.getAppliedOn());
        context.setVariable("reviewUrl", frontendUrl + "/manager/pending");

        dispatch(
                event.getRecipientEmail(),
                event.getEmployeeName() + " applied for leave",
                "email/leave-applied-email",
                context
        );
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendLeaveApprovedEmail(LeaveApprovedEvent event) {
        Context context = new Context();
        context.setVariable("employeeName", event.getEmployeeName());
        context.setVariable("leaveType", formatEnum(event.getLeaveType()));
        context.setVariable("startDate", event.getStartDate());
        context.setVariable("endDate", event.getEndDate());
        context.setVariable("totalDays", event.getTotalDays());
        context.setVariable("remarks", event.getRemarks());
        context.setVariable("actionDate", event.getActionDate());
        context.setVariable("myLeavesUrl", frontendUrl + "/employee/leaves");

        dispatch(
                event.getRecipientEmail(),
                "Your leave request has been approved",
                "email/leave-approved-email",
                context
        );
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendLeaveRejectedEmail(LeaveRejectedEvent event) {
        Context context = new Context();
        context.setVariable("employeeName", event.getEmployeeName());
        context.setVariable("leaveType", formatEnum(event.getLeaveType()));
        context.setVariable("startDate", event.getStartDate());
        context.setVariable("endDate", event.getEndDate());
        context.setVariable("totalDays", event.getTotalDays());
        context.setVariable("remarks", event.getRemarks());
        context.setVariable("actionDate", event.getActionDate());
        context.setVariable("myLeavesUrl", frontendUrl + "/employee/leaves");

        dispatch(
                event.getRecipientEmail(),
                "Your leave request has been rejected",
                "email/leave-rejected-email",
                context
        );
    }

    /**
     * Renders the given Thymeleaf template and sends it as an HTML email.
     * All failures are caught and logged — this method never throws.
     */
    private void dispatch(String to, String subject, String template, Context context) {
        if (!mailEnabled) {
            log.info("Email sending is disabled (app.mail.enabled=false). Skipped '{}' to {}", template, to);
            return;
        }

        if (to == null || to.isBlank()) {
            log.warn("Skipped sending '{}' email — recipient address is missing.", template);
            return;
        }

        try {
            String htmlBody = templateEngine.process(template, context);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name()
            );

            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            mailSender.send(message);
            log.info("Email '{}' sent successfully to {}", template, to);
        } catch (MessagingException | MailException ex) {
            log.error("Failed to send email '{}' to {}: {}", template, to, ex.getMessage(), ex);
        } catch (Exception ex) {
            log.error("Unexpected error while sending email '{}' to {}: {}", template, to, ex.getMessage(), ex);
        }
    }

    private String formatEnum(String rawValue) {
        if (rawValue == null || rawValue.isBlank()) {
            return "";
        }
        String lower = rawValue.toLowerCase().replace('_', ' ');
        return Character.toUpperCase(lower.charAt(0)) + lower.substring(1);
    }
}
