package com.diksha.leavemanagementsystem.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Enables asynchronous method execution for the application and provides
 * a dedicated, bounded thread pool for email dispatch so notification
 * sending never runs on the caller's request thread and never grows
 * unbounded under load.
 * <p>
 * Any future async work (e.g. other notification channels) can either
 * reuse the "emailTaskExecutor" bean or define its own dedicated executor
 * following this same pattern.
 */
@Configuration
@EnableAsync
@Slf4j
public class AsyncConfig implements AsyncConfigurer {

    @Bean(name = "emailTaskExecutor")
    public Executor emailTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("EmailAsync-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(20);
        executor.initialize();
        return executor;
    }

    @Override
    public Executor getAsyncExecutor() {
        return emailTaskExecutor();
    }

    /**
     * Safety net: EmailServiceImpl already catches and logs its own
     * exceptions so business flows are never affected, but this handler
     * ensures nothing is ever silently swallowed if a future @Async
     * method forgets to do the same.
     */
    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return (throwable, method, params) -> log.error(
                "Unhandled exception in async method '{}' with arguments {}",
                method.getName(), params, throwable);
    }
}
