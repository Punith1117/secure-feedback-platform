import type { CourseOffering } from "@/lib/db/schema";

interface CourseOfferingsSidebarProps {
  offerings: (CourseOffering & { templateName: string })[];
}

export default function CourseOfferingsSidebar({ offerings }: CourseOfferingsSidebarProps) {
  return (
    <aside className="w-full md:w-64 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden h-fit">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
          Course Offerings
        </h2>
      </div>
      <div className="p-2 max-h-[60vh] overflow-y-auto">
        <ul className="space-y-1">
          {offerings.length === 0 ? (
            <li className="px-3 py-4 text-center text-gray-500 text-sm italic">
              No offerings yet.
            </li>
          ) : (
            offerings.map((offering) => (
              <li 
                key={offering.id} 
                className="group px-3 py-2 hover:bg-blue-50 rounded-md transition-all duration-200 cursor-default border border-transparent hover:border-blue-100"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-800 truncate" title={offering.title}>
                    {offering.title}
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium truncate max-w-[100px]" title={offering.templateName}>
                      {offering.templateName}
                    </span>
                    <span className="text-[10px] text-gray-400 group-hover:text-blue-400 transition-colors">
                      {new Date(offering.createdAt).toLocaleDateString()}
                    </span>
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
