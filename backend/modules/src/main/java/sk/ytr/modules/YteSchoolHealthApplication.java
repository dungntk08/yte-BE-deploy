package sk.ytr.modules;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.scheduling.annotation.EnableAsync;

@Slf4j
@SpringBootApplication
@EnableAspectJAutoProxy
@EnableAsync
public class YteSchoolHealthApplication {

	public static void main(String[] args) {
		SpringApplication.run(YteSchoolHealthApplication.class, args);
	}

}
