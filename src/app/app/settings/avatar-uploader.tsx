
'use client';

import { useState, useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { createClient } from '@/lib/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Camera } from 'lucide-react';
import type { ProfileWithEmail } from '@/app/actions/profile';
import { updateAvatarUrl } from '@/app/actions/profile';

function SubmitButton({ disabled }: { disabled: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button size="sm" type="submit" disabled={pending || disabled}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
        </Button>
    )
}

export function AvatarUploader({ profile, publicUrl }: { profile: ProfileWithEmail | null, publicUrl: string }) {
    const supabase = createClient();
    const { toast } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(publicUrl);
    const [isUploading, setIsUploading] = useState(false);
    const [state, formAction] = useActionState(updateAvatarUrl, null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };
    
    useEffect(() => {
        // This effect ensures the preview is updated if the profile data changes,
        // for instance, after an initial load.
        if (publicUrl) {
            setPreview(publicUrl);
        }
    }, [publicUrl]);

    useEffect(() => {
        if (state?.success) {
            toast({ title: 'Success', description: state.success });
            setFile(null); // Reset file input after successful upload
        }
        if (state?.error) {
            toast({ variant: 'destructive', title: 'Error', description: state.error });
        }
    }, [state, toast]);

    const handleFormSubmit = async (formData: FormData) => {
        if (!file || !profile) return;
        setIsUploading(true);

        const fileExt = file.name.split('.').pop();
        const filePath = `${profile.id}-${Date.now()}.${fileExt}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

            formData.set('avatarUrl', data.publicUrl);
            formAction(formData);

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Upload Failed', description: error.message });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <form action={handleFormSubmit} className="flex flex-col items-center gap-4">
            <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-muted">
                    <AvatarImage src={preview ?? undefined} alt={profile?.full_name || "User Avatar"} />
                    <AvatarFallback>
                        <User className="h-16 w-16" />
                    </AvatarFallback>
                </Avatar>
                <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity"
                >
                    <Camera className="h-8 w-8 text-white" />
                </label>
            </div>
            <Input
                id="avatar-upload"
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleFileChange}
                className="hidden"
            />
            <SubmitButton disabled={!file || isUploading} />
        </form>
    );
}
