CREATE OR REPLACE PROCEDURE get_all_employees (
    p_emps OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_emps FOR
        SELECT employee_id,
               first_name,
               last_name,
               email,
               salary
          FROM employees;
END;


@Repository
public class EmployeeRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<Employee> getAllEmployees() {
        SimpleJdbcCall jdbcCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("get_all_employees")
                .declareParameters(new SqlOutParameter("p_emps", OracleTypes.CURSOR,
                        (rs, rowNum) -> mapRowToEmployee(rs)));

        Map<String, Object> result = jdbcCall.execute();

        return (List<Employee>) result.get("p_emps");
    }

    private Employee mapRowToEmployee(ResultSet rs) throws SQLException {
        Employee emp = new Employee();
        emp.setEmployeeId(rs.getInt("employee_id"));
        emp.setFirstName(rs.getString("first_name"));
        emp.setLastName(rs.getString("last_name"));
        emp.setEmail(rs.getString("email"));
        emp.setSalary(rs.getDouble("salary"));
        return emp;
    }
}

public class Employee {
    private int employeeId;
    private String firstName;
    private String lastName;
    private String email;
    private double salary;

    // getters and setters
}