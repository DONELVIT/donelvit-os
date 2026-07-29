export type ProjectStatus = "new" | "in_progress" | "review" | "completed" | "archived";
export type ProjectListItem = {
  id:number; project_number:string|null; title:string; stage:string; status:string;
  due_date:string|null; amount:number|null; currency:string; responsible_person:string|null;
  client_name:string; object_name:string|null; project_type_name:string|null;
};
export type ProjectDetails = ProjectListItem & {
  client_id:number; object_id:number|null; project_type_id:number; start_date:string|null;
  notes:string|null; location:string|null; created_at:string; updated_at:string;
  drive_folder_url?:string|null; todoist_url?:string|null;
};
export type SelectOption={id:number;name:string;client_id?:number|null};
export type ProjectSystem={id:number;code:string;name:string;description:string|null;notes:string|null};
export type ProjectDocument={id:number;document_type:string;document_number:string|null;title:string;status:string;revision:string|null;issued_at:string|null;drive_file_url:string|null};
export type ClientListItem={id:number;legal_name:string;fiscal_code:string|null;email:string|null;phone:string|null;is_active:boolean;projects_count:number;objects_count:number;contracts_count:number};
export type ClientDetails=ClientListItem & {vat_code:string|null;legal_address:string|null;postal_address:string|null;iban:string|null;bank_name:string|null;bank_bic:string|null;representative_position:string|null;representative_name:string|null;signing_basis:string|null;contact_person:string|null;notes:string|null};
