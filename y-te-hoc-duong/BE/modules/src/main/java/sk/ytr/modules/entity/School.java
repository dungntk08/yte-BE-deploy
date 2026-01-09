package sk.ytr.modules.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@Entity
@Table(name = "school")
public class School {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "school_seq")
    @SequenceGenerator(name = "school_seq", sequenceName = "school_seq", allocationSize = 1)
    private Long id;

    @Column(name = "school_code")
    private String schoolCode;

    @Column(name = "school_name")
    private String schoolName;

    @Column(name = "address")
    private String address;

}
