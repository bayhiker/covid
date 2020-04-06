export function getProblemSummary(problem, length = 300) {
  let problemSummary = problem.sample_problem;
  if (problemSummary !== undefined) {
    return problemSummary.substring(0, length);
  }
  if (problem.statement !== undefined) {
    problemSummary = problem.statement.substring(0, length);
  } else if (problem.questions.length > 0) {
    problemSummary = problem.questions[0].stem.substring(0, length);
  }
  return problemSummary;
}

export class ProblemAuthor {
  constructor(problem) {
    this.problem = problem;
  }

  authorIsDefined() {
    return typeof this.problem.author !== 'undefined';
  }

  firstNameIsDefined() {
    return (
      this.authorIsDefined() &&
      typeof this.problem.author.first_name !== 'undefined' &&
      this.problem.author.first_name.length > 0
    );
  }

  lastNameIsDefined() {
    return (
      this.authorIsDefined &&
      typeof this.problem.author.last_name !== 'undefined' &&
      this.problem.author.last_name.length > 0
    );
  }

  getAuthorInitials() {
    return (
      (this.firstNameIsDefined()
        ? this.problem.author.first_name.substring(0, 1)
        : '') +
      (this.lastNameIsDefined
        ? this.problem.author.last_name.substring(0, 1)
        : '')
    );
  }

  getAuthorShortName() {
    return (
      (this.firstNameIsDefined() ? this.problem.author.first_name : '') +
      (this.lastNameIsDefined()
        ? this.problem.author.last_name.substring(0, 1)
        : '')
    );
  }
}
