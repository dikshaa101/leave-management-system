package com.diksha.leavemanagementsystem.service;

import com.diksha.leavemanagementsystem.event.EmployeeRegisteredEvent;
import com.diksha.leavemanagementsystem.event.LeaveAppliedEvent;
import com.diksha.leavemanagementsystem.event.LeaveApprovedEvent;
import com.diksha.leavemanagementsystem.event.LeaveRejectedEvent;

/**
 * Reusable, notification-agnostic email dispatch contract.
 * <p>
 * Implementations MUST:
 * <ul>
 *   <li>send email asynchronously so callers are never blocked by SMTP I/O</li>
 *   <li>never let a failed send propagate an exception back to the caller</li>
 * </ul>
 * <p>
 * To add a new notification type in the future (holiday announcements,
 * password reset, reminders, etc.), add a method here, implement it in
 * {@code EmailServiceImpl}, create its HTML template under
 * {@code resources/templates/email/}, and publish + handle a matching
 * event exactly like the four below.
 */
public interface EmailService {

    void sendWelcomeEmail(EmployeeRegisteredEvent event);

    void sendLeaveAppliedEmail(LeaveAppliedEvent event);

    void sendLeaveApprovedEmail(LeaveApprovedEvent event);

    void sendLeaveRejectedEmail(LeaveRejectedEvent event);
}
