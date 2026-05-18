import {supabase} from '../config/supabase.js'
import type { PatientCreationData } from '../types/index.js';

export const PatientService = {

    async createPatient(payload: PatientCreationData){
        try{
            const { data, error } = await supabase.auth.admin.createUser({
                email: payload.email,
                password: 'HACKATON',
                email_confirm: true,
            })
            
            if ( error ){
                console.error("Error creating user:", error);
                throw new Error(`${error.message}`);
            }

            const user_id = data.user?.id;
            console.log("User created with ID:", user_id);
            
            const {data: profileData, error: profileError} = await supabase
                .from('patients')
                .update({
                    email: payload.email,
                    full_name: payload.full_name,
                    document_type: payload.document_type,
                    document_number: payload.document_number,
                    phone: payload.phone,
                    birth_date: payload.birth_date,
                    gender: payload.gender,
                    emergency_contact_name: payload.emergency_contact_name,
                    emergency_contact_phone: payload.emergency_contact_phone
                })
                .eq('id', user_id)
                .select()
                .single();
        if ( profileError ){
            console.error("Error updating user profile:", profileError);
            throw new Error(`${profileError.message}`);        
        }
        console.log("Patient profile updated:", profileData);
        

        return {
            success: true,
            patient: profileData
        }
 

        }catch(error: any){
            console.error("Error in createPatient:", error);
            throw new Error(`${error.message}`);
        }

    }
    
}