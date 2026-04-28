import CreateInstanceForm from "@/components/create-instance-form";

export default function NewInstancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Create Feedback Instance</h1>
        <CreateInstanceForm />
      </div>
    </div>
  );
}
