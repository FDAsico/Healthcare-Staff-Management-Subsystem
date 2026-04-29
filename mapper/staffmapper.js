export const staffMapper = {
  toDTO(staff) {
    return {
      id: staff.staff_id,
      employeeId: staff.employeeId,
      firstName: staff.firstName,
      lastName: staff.lastName,
      fullName: `${staff.firstName} ${staff.lastName}`,
      email: staff.email || staff.user?.email || null,
      phone: staff.phone || staff.contactNo || null,
      role: staff.role,
      department: staff.department
        ? { id: staff.department.department_id, name: staff.department.name }
        : null,
      status: staff.status,
      specialization: staff.specialization,
      hiredAt: staff.hiredAt,
      userId: staff.user_id,
      isActive: staff.user?.isActive ?? true,
    };
  },

  toDTOList(staffList) {
    return staffList.map(this.toDTO);
  },

  toDetailDTO(staff) {
    return {
      ...this.toDTO(staff),
      dateOfBirth: staff.dateOfBirth,
      gender: staff.gender,
      address: staff.address,
      availability: staff.availability,
      documents:
        staff.documents?.map((d) => ({
          id: d.document_id,
          type: d.documentType,
          title: d.title,
          expiryDate: d.expiryDate,
          isVerified: d.isVerified,
        })) || [],
      emergencyContacts: staff.emergencyContacts || [],
    };
  },
};

export default staffMapper;