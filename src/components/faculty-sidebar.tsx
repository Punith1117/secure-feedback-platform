import type { Faculty } from "@/lib/db/schema";
import DeleteFacultyButton from "./delete-faculty-button";

interface FacultySidebarProps {
  facultyList: Faculty[];
}

export default function FacultySidebar({ facultyList }: FacultySidebarProps) {
  return (
    <aside className="w-full md:w-64 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden h-fit">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
          Faculty Members
        </h2>
      </div>
      <div className="p-2 max-h-[60vh] overflow-y-auto">
        <ul className="space-y-1">
          {facultyList.length === 0 ? (
            <li className="px-3 py-4 text-center text-gray-500 text-sm italic">
              No faculty members yet.
            </li>
          ) : (
            facultyList.map((faculty) => (
              <li 
                key={faculty.id} 
                className="group px-3 py-2 hover:bg-blue-50 rounded-md transition-all duration-200 cursor-default border border-transparent hover:border-blue-100"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-800 truncate" title={faculty.name}>
                    {faculty.name}
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-gray-400 group-hover:text-blue-400 transition-colors">
                      Added {new Date(faculty.createdAt).toLocaleDateString()}
                    </span>
                    <DeleteFacultyButton facultyId={faculty.id} userId={faculty.userId} />
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </aside>
  );
}
