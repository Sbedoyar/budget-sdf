package com.budgetsdf;

import com.budgetsdf.alert.controller.AlertController;
import com.budgetsdf.alert.service.AlertService;
import com.budgetsdf.alert.service.AlertServiceImpl;
import com.budgetsdf.category.controller.CategoryController;
import com.budgetsdf.category.repository.CategoryRepository;
import com.budgetsdf.category.service.CategoryService;
import com.budgetsdf.category.service.CategoryServiceImpl;
import com.budgetsdf.common.security.GoogleTokenService;
import com.budgetsdf.common.security.JwtService;
import com.budgetsdf.movement.controller.MovementController;
import com.budgetsdf.movement.repository.MovementRepository;
import com.budgetsdf.movement.service.MovementService;
import com.budgetsdf.movement.service.MovementServiceImpl;
import com.budgetsdf.product.controller.ProductController;
import com.budgetsdf.product.repository.ProductRepository;
import com.budgetsdf.product.service.ProductService;
import com.budgetsdf.product.service.ProductServiceImpl;
import com.budgetsdf.report.controller.ReportController;
import com.budgetsdf.report.service.ReportService;
import com.budgetsdf.report.service.ReportServiceImpl;
import com.budgetsdf.user.controller.AuthController;
import com.budgetsdf.user.repository.UserRepository;
import com.budgetsdf.user.service.UserService;
import com.budgetsdf.user.service.UserServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class ServiceInjectionTests {

    @Test
    void resolvesServiceInterfacesAndInjectsAllControllers() {
        new ApplicationContextRunner()
                .withPropertyValues("app.jwt.expiration-ms=28800000")
                .withBean(CategoryRepository.class, () -> mock(CategoryRepository.class))
                .withBean(ProductRepository.class, () -> mock(ProductRepository.class))
                .withBean(MovementRepository.class, () -> mock(MovementRepository.class))
                .withBean(UserRepository.class, () -> mock(UserRepository.class))
                .withBean(PasswordEncoder.class, () -> mock(PasswordEncoder.class))
                .withBean(JwtService.class, () -> mock(JwtService.class))
                .withBean(GoogleTokenService.class, () -> mock(GoogleTokenService.class))
                .withUserConfiguration(
                        CategoryServiceImpl.class, ProductServiceImpl.class,
                        MovementServiceImpl.class, ReportServiceImpl.class,
                        AlertServiceImpl.class, UserServiceImpl.class,
                        CategoryController.class, ProductController.class,
                        MovementController.class, ReportController.class,
                        AlertController.class, AuthController.class)
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    assertThat(context).hasSingleBean(CategoryService.class);
                    assertThat(context).hasSingleBean(ProductService.class);
                    assertThat(context).hasSingleBean(MovementService.class);
                    assertThat(context).hasSingleBean(ReportService.class);
                    assertThat(context).hasSingleBean(AlertService.class);
                    assertThat(context).hasSingleBean(UserService.class);
                    assertThat(context).hasSingleBean(CategoryController.class);
                    assertThat(context).hasSingleBean(ProductController.class);
                    assertThat(context).hasSingleBean(MovementController.class);
                    assertThat(context).hasSingleBean(ReportController.class);
                    assertThat(context).hasSingleBean(AlertController.class);
                    assertThat(context).hasSingleBean(AuthController.class);
                });
    }
}
