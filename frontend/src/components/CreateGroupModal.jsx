import React, { useState, useEffect, useContext } from 'react';
import useAxios from '../api/axiosConfig';
import { toast } from 'react-toastify';
import UserContext from '../context/UserContext';

const CreateGroupModal = ({ showModal, setShowModal, onSuccess }) => {
  const [groupName, setGroupName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState([]);
  const [students, setStudents] = useState([]);
  const { userData } = useContext(UserContext);
  const axiosInstance = useAxios();

  useEffect(() => {
    // Debounce the performSearch function
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        performSearch(searchTerm);
      }
    }, 500); // 500ms delay

    // Cleanup function to cancel the timeout if searchTerm changes
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const performSearch = async (searchTerm) => {
    const response = await axiosInstance.get(
      `/search-students?keyword=${searchTerm}`
    );
    const students = response.data?.students || [];
    const onlySomeStudents = students.slice(0, 3);
    setStudents(onlySomeStudents);
  }

  const handleSelectStudent = (student) => {
    if (!selectedStudent.includes(student)) {
      setSelectedStudent([...selectedStudent, student]);
    }
  };

  const handleRemoveStudent = (student) => {
    setSelectedStudent(selectedStudent.filter((i) => i.id !== student.id));
  };

  const createGroup = async () => {
    try {
      await axiosInstance.post("/create_group", {
        "group_name": groupName,
        "userids": [...selectedStudent.map(s => s.id), userData.id]
      })
      toast.success('Group created');
      onSuccess();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Something went wrong. Please try again.';
      toast.error(errorMessage);
    } finally {
      setGroupName('');
      setSelectedStudent([]);
      setShowModal(false);
    }
  }

  return (
    <>
      {showModal ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white w-full max-w-lg mx-auto rounded-lg shadow-lg relative">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Create Group</h2>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
            </div>

            {/* Body */}
            <div className="p-4">
              {/* Group Name Input */}
              <input
                type="text"
                placeholder="Group Name"
                className="w-full p-2 border rounded mb-4"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />

              {/* Search Bar */}
              <input
                type="text"
                placeholder="Search users..."
                className="w-full p-2 border rounded mb-4"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value) }}
              />

              {/* Selected Students */}
              {selectedStudent.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold mb-2">Selected Users:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudent.map((student) => (
                      <span
                        key={student.id}
                        className="flex items-center space-x-2 bg-blue-100 text-blue-600 px-2 py-1 rounded"
                      >
                        <span>{student.firstname} {student.lastname}</span>
                        <button
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleRemoveStudent(student)}
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Students List */}
              <ul className="max-h-40 overflow-y-auto divide-y divide-gray-200 py-3 flex flex-col gap-3 align-end">
                {students.map((student) => (
                  <li className="pb-3 sm:pb-4 hover:bg-slate-200 p-2 rounded-lg cursor-pointer" onClick={() => handleSelectStudent(student)}>
                    <div className="flex items-center justify-between w-full">
                      <div className="text-start flex items-center space-x-4 rtl:space-x-reverse">
                        <div className="flex-shrink-0">
                          <img className="w-8 h-8 rounded-full" src={student.profile_picture} alt="Neil image" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {student.firstname} {student.lastname}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer */}
            <div className="flex justify-end p-4 border-t">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={createGroup}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default CreateGroupModal;
