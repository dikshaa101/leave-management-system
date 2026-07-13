package com.diksha.leavemanagementsystem.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LeavePolicyStatusUpdateDto {

    @NotNull(message = "Active status is required")
    private Boolean active;
}
