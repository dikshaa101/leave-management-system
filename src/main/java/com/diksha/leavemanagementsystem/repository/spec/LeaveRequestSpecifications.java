package com.diksha.leavemanagementsystem.repository.spec;

import com.diksha.leavemanagementsystem.dto.request.ReportFilterDto;
import com.diksha.leavemanagementsystem.entity.LeaveRequest;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

/**
 * Builds a company-isolated, filter-aware {@link Specification} for
 * {@link LeaveRequest} report queries.
 * <p>
 * Company isolation is always applied and is never optional — every other
 * predicate here is only added when the corresponding filter is present.
 * Also performs a left fetch-join on {@code employee} so that reading
 * {@code employee.fullName}/{@code department} per row does not trigger
 * an N+1 query for each leave request.
 */
public final class LeaveRequestSpecifications {

    private LeaveRequestSpecifications() {
        // Utility class - no instantiation
    }

    public static Specification<LeaveRequest> forCompanyWithFilters(Long companyId, ReportFilterDto filter) {

        return (root, query, cb) -> {

            // Avoid duplicate rows and unnecessary fetch-joins on count queries
            // (Spring Data issues a separate COUNT query for pagination, which
            // this repository doesn't use, but the guard is cheap and safe).
            if (query.getResultType() != Long.class && query.getResultType() != long.class) {
                root.fetch("employee", JoinType.LEFT);
            }

            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("employee").get("company").get("id"), companyId));

            if (filter != null) {
                if (filter.getEmployeeId() != null) {
                    predicates.add(cb.equal(root.get("employee").get("id"), filter.getEmployeeId()));
                }

                if (filter.getDepartment() != null && !filter.getDepartment().isBlank()) {
                    predicates.add(cb.equal(
                            cb.lower(root.get("employee").get("department")),
                            filter.getDepartment().trim().toLowerCase()));
                }

                if (filter.getLeaveType() != null) {
                    predicates.add(cb.equal(root.get("leaveType"), filter.getLeaveType()));
                }

                if (filter.getStatus() != null) {
                    predicates.add(cb.equal(root.get("status"), filter.getStatus()));
                }

                if (filter.getStartDate() != null) {
                    predicates.add(cb.greaterThanOrEqualTo(root.get("startDate"), filter.getStartDate()));
                }

                if (filter.getEndDate() != null) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("endDate"), filter.getEndDate()));
                }
            }

            query.distinct(true);

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
