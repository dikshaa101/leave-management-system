package com.diksha.leavemanagementsystem.repository;

import com.diksha.leavemanagementsystem.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CompanyRepository
        extends JpaRepository<Company, Long> {

    Optional<Company> findByCompanyCode(String companyCode);

    Optional<Company> findByCompanyName(String companyName);

    boolean existsByCompanyCode(String companyCode);

    boolean existsByCompanyName(String companyName);

}