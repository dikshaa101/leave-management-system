package com.diksha.leavemanagementsystem.service.impl;

import com.diksha.leavemanagementsystem.dto.request.HolidayRequestDto;
import com.diksha.leavemanagementsystem.dto.response.HolidayResponseDto;
import com.diksha.leavemanagementsystem.entity.Company;
import com.diksha.leavemanagementsystem.entity.Holiday;
import com.diksha.leavemanagementsystem.entity.User;
import com.diksha.leavemanagementsystem.exception.BadRequestException;
import com.diksha.leavemanagementsystem.exception.ResourceNotFoundException;
import com.diksha.leavemanagementsystem.repository.HolidayRepository;
import com.diksha.leavemanagementsystem.repository.UserRepository;
import com.diksha.leavemanagementsystem.service.HolidayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Default {@link HolidayService} implementation.
 * <p>
 * All operations are scoped to the logged-in user's company, giving strict
 * multi-tenant isolation: a manager can never read, edit, or delete a
 * holiday that belongs to another company.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class HolidayServiceImpl implements HolidayService {

    private final HolidayRepository holidayRepository;
    private final UserRepository userRepository;

    /**
     * Returns the logged-in user's company.
     */
    private Company getLoggedInCompany() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        return user.getCompany();
    }

    @Override
    @Transactional
    public HolidayResponseDto addHoliday(HolidayRequestDto dto) {

        Company company = getLoggedInCompany();

        validateHolidayDate(dto.getHolidayDate());

        if (holidayRepository.existsByCompanyIdAndHolidayDate(
                company.getId(), dto.getHolidayDate())) {
            throw new BadRequestException(
                    "A holiday already exists on " + dto.getHolidayDate()
                            + " for your company.");
        }

        Holiday holiday = Holiday.builder()
                .company(company)
                .holidayName(dto.getHolidayName())
                .holidayDate(dto.getHolidayDate())
                .description(dto.getDescription())
                .optionalHoliday(dto.isOptionalHoliday())
                .build();

        Holiday saved = holidayRepository.save(holiday);

        log.info("Holiday '{}' created on {} for company id {}",
                saved.getHolidayName(), saved.getHolidayDate(), company.getId());

        return mapToDto(saved);
    }

    @Override
    @Transactional
    public HolidayResponseDto updateHoliday(Long id, HolidayRequestDto dto) {

        Company company = getLoggedInCompany();

        Holiday holiday = holidayRepository
                .findByIdAndCompanyId(id, company.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Holiday not found"));

        validateHolidayDate(dto.getHolidayDate());

        if (holidayRepository.existsByCompanyIdAndHolidayDateAndIdNot(
                company.getId(), dto.getHolidayDate(), id)) {
            throw new BadRequestException(
                    "A holiday already exists on " + dto.getHolidayDate()
                            + " for your company.");
        }

        holiday.setHolidayName(dto.getHolidayName());
        holiday.setHolidayDate(dto.getHolidayDate());
        holiday.setDescription(dto.getDescription());
        holiday.setOptionalHoliday(dto.isOptionalHoliday());

        Holiday saved = holidayRepository.save(holiday);

        log.info("Holiday id {} updated for company id {}", id, company.getId());

        return mapToDto(saved);
    }

    @Override
    @Transactional
    public void deleteHoliday(Long id) {

        Company company = getLoggedInCompany();

        Holiday holiday = holidayRepository
                .findByIdAndCompanyId(id, company.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Holiday not found"));

        holidayRepository.delete(holiday);

        log.info("Holiday id {} deleted for company id {}", id, company.getId());
    }

    @Override
    public List<HolidayResponseDto> getCompanyHolidays() {

        Company company = getLoggedInCompany();

        return holidayRepository
                .findByCompanyIdOrderByHolidayDateAsc(company.getId())
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public Set<LocalDate> getHolidayDatesInRange(
            Company company, LocalDate startDate, LocalDate endDate) {

        if (company == null || startDate == null || endDate == null) {
            return Set.of();
        }

        return holidayRepository
                .findByCompanyIdAndHolidayDateBetween(company.getId(), startDate, endDate)
                .stream()
                .map(Holiday::getHolidayDate)
                .collect(Collectors.toUnmodifiableSet());
    }

    private void validateHolidayDate(LocalDate holidayDate) {
        if (holidayDate.isBefore(LocalDate.now())) {
            throw new BadRequestException("Holiday date cannot be in the past.");
        }
    }

    private HolidayResponseDto mapToDto(Holiday holiday) {
        return HolidayResponseDto.builder()
                .id(holiday.getId())
                .holidayName(holiday.getHolidayName())
                .holidayDate(holiday.getHolidayDate())
                .description(holiday.getDescription())
                .optionalHoliday(holiday.isOptionalHoliday())
                .createdAt(holiday.getCreatedAt())
                .build();
    }
}
