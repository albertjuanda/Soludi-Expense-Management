import React from 'react';
import SubmissionForm from '../components/expenses/SubmissionForm';

const SubmitExpensePage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Submit Expense</h1>
        <p className="text-slate-500 text-sm mt-1">Fill in the details and attach your receipt to submit a reimbursement request.</p>
      </div>
      <SubmissionForm />
    </div>
  );
};

export default SubmitExpensePage;
