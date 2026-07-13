package com.diksha.leavemanagementsystem.listener;

import com.diksha.leavemanagementsystem.event.EmployeeRegisteredEvent;
import com.diksha.leavemanagementsystem.event.LeaveAppliedEvent;
import com.diksha.leavemanagementsystem.event.LeaveApprovedEvent;
import com.diksha.leavemanagementsystem.event.LeaveRejectedEvent;
import com.diksha.leavemanagementsystem.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Bridges the application's domain events to email notifications.
 * <p>
 * Kept intentionally "thin": each handler only logs and delegates to the
 * appropriate {@link EmailService} method, which is itself {@code @Async}.
 * This means listener methods return almost instantly regardless of SMTP
 * latency, and the publishing service (Auth/Leave/Approval) is never
 * blocked or affected by email failures.
 * <p>
 * To wire up a future notification (e.g. a HolidayAnnouncedEvent), add a
 * new {@code @EventListener} method here that calls the matching
 * {@link EmailService} method.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class EmailEventListener {

    private final EmailService emailService;

    @EventListener
    public void onEmployeeRegistered(EmployeeRegisteredEvent event) {
        log.debug("Received EmployeeRegisteredEvent for {}", event.getEmployeeEmail());
        emailService.sendWelcomeEmail(event);
    }

    @EventListener
    public void onLeaveApplied(LeaveAppliedEvent event) {
        log.debug("Received LeaveAppliedEvent for manager {}", event.getRecipientEmail());
        emailService.sendLeaveAppliedEmail(event);
    }

    @EventListener
    public void onLeaveApproved(LeaveApprovedEvent event) {
        log.debug("Received LeaveApprovedEvent for {}", event.getRecipientEmail());
        emailService.sendLeaveApprovedEmail(event);
    }

    @EventListener
    public void onLeaveRejected(LeaveRejectedEvent event) {
        log.debug("Received LeaveRejectedEvent for {}", event.getRecipientEmail());
        emailService.sendLeaveRejectedEmail(event);
    }
}
