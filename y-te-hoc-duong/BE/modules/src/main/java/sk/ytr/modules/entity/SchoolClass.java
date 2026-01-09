package sk.ytr.modules.entity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "school_class")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchoolClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Trường học */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    /** Tên lớp: Lớp 5A1 */
    @Column(name = "class_name", nullable = false)
    private String className;

    /** Khối */
    @Column(name = "grade", nullable = false)
    private Integer grade;

    /** Tổng số học sinh */
    @Column(name = "total_student")
    private Integer totalStudent;

    /** Năm học */
    @Column(name = "school_year", nullable = false)
    private String schoolYear;
}

