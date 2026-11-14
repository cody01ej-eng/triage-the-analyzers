package team.projectpulse.system;

import org.junit.jupiter.api.Test;
import team.projectpulse.evaluation.PeerEvaluationAverage;
import team.projectpulse.notification.ReminderService;
import team.projectpulse.ram.document.template.DocumentTemplate;
import team.projectpulse.ram.requirement.dto.ArtifactTraceability;
import team.projectpulse.rubric.dto.RubricDto;
import team.projectpulse.student.Student;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashSet;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CollectionBoundaryTest {

    @Test
    void beanListsKeepTheirSnapshotWhenTheCallerChangesEitherBoundary() {
        PeerEvaluationAverage average = new PeerEvaluationAverage();
        ArrayList<String> comments = new ArrayList<>(Arrays.asList("first", null, "last"));
        average.setPublicComments(comments);

        comments.clear();
        assertThat(average.getPublicComments()).containsExactly("first", null, "last");

        average.getPublicComments().clear();
        assertThat(average.getPublicComments()).containsExactly("first", null, "last");

        average.setPublicComments(null);
        assertThat(average.getPublicComments()).isNull();
    }

    @Test
    void recordListsKeepNullElementsAndRejectMutationOfTheirSnapshot() {
        ArrayList<team.projectpulse.ram.requirement.dto.ArtifactLinkViewDto> links = new ArrayList<>();
        links.add(null);
        ArtifactTraceability traceability = new ArtifactTraceability(1L, links, null);

        links.clear();
        assertThat(traceability.incoming()).containsExactly((team.projectpulse.ram.requirement.dto.ArtifactLinkViewDto) null);
        assertThat(traceability.outgoing()).isNull();
        assertThatThrownBy(() -> traceability.incoming().clear()).isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    void recordSetsKeepNullElementsWithoutAliasingTheInput() {
        LinkedHashSet<team.projectpulse.rubric.dto.CriterionDto> criteria = new LinkedHashSet<>();
        criteria.add(null);
        RubricDto rubric = new RubricDto(1, "Peer evaluation", criteria, 1);

        criteria.clear();
        assertThat(rubric.criteria()).containsExactly((team.projectpulse.rubric.dto.CriterionDto) null);
        assertThatThrownBy(() -> rubric.criteria().clear()).isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    void templatesCopyTheListWithoutCopyingSectionIdentities() {
        DocumentTemplate template = new DocumentTemplate();
        DocumentTemplate.SectionTemplate section = new DocumentTemplate.SectionTemplate();
        ArrayList<DocumentTemplate.SectionTemplate> sections = new ArrayList<>();
        sections.add(section);
        template.setSections(sections);

        sections.clear();
        assertThat(template.getSections()).containsExactly(section);
        template.getSections().clear();
        assertThat(template.getSections()).containsExactly(section);
    }

    @Test
    void reminderResultsSnapshotMembershipAndPreserveStudentIdentity() {
        Student student = new Student();
        ArrayList<Student> failed = new ArrayList<>();
        failed.add(student);
        ReminderService.ReminderResult result = new ReminderService.ReminderResult(0, failed);

        failed.clear();
        assertThat(result.failed()).containsExactly(student);
        assertThat(result.failed().getFirst()).isSameAs(student);
        assertThatThrownBy(() -> result.failed().clear()).isInstanceOf(UnsupportedOperationException.class);
    }
}
