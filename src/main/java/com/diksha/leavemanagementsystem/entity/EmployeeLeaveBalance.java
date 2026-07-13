package com.diksha.leavemanagementsystem.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "employee_leave_balances",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_employee_leave_type",
                columnNames = {"employee_id", "leave_type"}
        )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeLeaveBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Enumerated(EnumType.STRING)
    @Column(name = "leave_type", nullable = false)
    private LeaveType leaveType;

    /**
     * Snapshot of the policy's totalLeaves at the time this balance was
     * provisioned. Kept alongside remainingBalance so the UI can show
     * "X of Y days used" without a second lookup against LeavePolicy,
     * which may since have changed or been deactivated.
     */
    @Column(nullable = false)
    private Integer totalAllocated;

    @Column(nullable = false)
    private Integer remainingBalance;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onSave() {
        this.updatedAt = LocalDateTime.now();
    }
}
