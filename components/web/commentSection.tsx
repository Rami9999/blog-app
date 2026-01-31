"use client"
import {useTransition, useState } from 'react'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Loader2, MessageSquare, Trash2, Pencil, X, Check } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod';
import { commentSchema } from '@/app/schemas/comment';
import { Field, FieldLabel, FieldError } from '../ui/field';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { useParams } from 'next/navigation'
import { Id } from '@/convex/_generated/dataModel'
import { Preloaded, useMutation, usePreloadedQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import z from 'zod'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { formatDistanceToNow } from "date-fns";
import { Separator } from '../ui/separator'
import { useAuth } from '@/lib/use-auth';

function CommentSection(props: {
    preLoadedCommnets: Preloaded<typeof api.comments.getCommentsByPostId>
}) {

    const params = useParams<{postId: Id<'posts'>}>();
    const data = usePreloadedQuery(props.preLoadedCommnets);
    const comments = data || [];
    const [isPending,startTransition] = useTransition();
    const createComment = useMutation(api.comments.createComment);
    const deleteComment = useMutation(api.comments.deleteComment);
    const updateComment = useMutation(api.comments.updateComment);
    
    // Use centralized auth hook
    const { isAuthenticated, isLoading } = useAuth(false);
    
    // State for edit mode
    const [editingId, setEditingId] = useState<Id<'comments'> | null>(null);
    const [editBody, setEditBody] = useState('');
    
    const form = useForm({
        resolver:zodResolver(commentSchema),
        defaultValues:{
            body:'',
            postId:params.postId,
        },
        
    });

    function onSubmit(data: z.infer<typeof commentSchema>){
        startTransition(async ()=>{
            try{
                await createComment(data)
                form.reset();
                toast.success("Comment submitted successfully!");

            }catch{
                toast.error("Failed to submit comment. Please try again.")
            }
        })
    }

    function onDelete(commentId: Id<'comments'>) {
        startTransition(async () => {
            try {
                await deleteComment({ commentId });
                toast.success("Comment deleted successfully!");
            } catch {
                toast.error("Failed to delete comment. Please try again.");
            }
        });
    }

    function onStartEdit(comment: typeof comments[0]) {
        setEditingId(comment._id);
        setEditBody(comment.body);
    }

    function onCancelEdit() {
        setEditingId(null);
        setEditBody('');
    }

    function onUpdate(commentId: Id<'comments'>) {
        startTransition(async () => {
            try {
                await updateComment({ commentId, body: editBody });
                setEditingId(null);
                setEditBody('');
                toast.success("Comment updated successfully!");
            } catch {
                toast.error("Failed to update comment. Please try again.");
            }
        });
    }

    if(data === undefined){
        return (
            <div className="flex justify-center items-center h-32">
                <p className="text-muted-foreground">Loading comments...</p>
            </div>
        );
    }
  return (
    <Card>
        <CardHeader className='flex flex-row items-center gap-2 border-b'>
            <MessageSquare className='size-5'/>
            <h2 className='text-xl font-bold'>{comments.length} Comments</h2>
        </CardHeader>

        <CardContent className="space-y-8">
            {/* Only show comment form for authenticated users */}
            {!isLoading && isAuthenticated && (
                <form className='space-y-4' onSubmit={form.handleSubmit(onSubmit)}>
                    <Controller name='body' control={form.control} render={({field,fieldState})=>(
                        <Field>
                            <FieldLabel>
                                Full Name
                            </FieldLabel>
                            <Textarea aria-invalid={fieldState.invalid} placeholder='Share your thoughts' {...field} />
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]}/>
                            )}
                        </Field>
                    )} />

                    <Button disabled={isPending}>
                        {isPending ? (
                            <>
                                <Loader2 className='size-4 animate-spin'/>
                                <span>Loading...</span>
                            </>
                        ):(
                            <span>Comment</span>
                        )}
                    </Button>
                </form>
            )}

            {/* Show login prompt for unauthenticated users */}
            {!isLoading && !isAuthenticated && (
                <div className="text-center py-4">
                    <p className="text-muted-foreground">
                        <a href="/auth/sign-up" className="text-primary hover:underline">Sign up</a> or{" "}
                        <a href="/auth/login" className="text-primary hover:underline">log in</a> to leave a comment.
                    </p>
                </div>
            )}

            {comments?.length > 0 && <Separator />}

            <section className='space-y-6'>
                {comments.map((comment)=>(
                    <div key={comment._id} className='flex gap-4'>
                        <Avatar className='size-10 shrink-0'>
                            <AvatarImage src={`https://avatar.vercel.sh/${comment.authorName || 'unknown'}`} alt={comment.authorName || 'Unknown Author'} />
                            <AvatarFallback>{comment.authorName?.slice(0,2).toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className='flex-1 space-y-1'>
                            <div className="flex items-center justify-between">
                                <p className="font-semibold text-sm">{comment.authorName}</p>
                                <p className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(comment._creationTime), { addSuffix: true })}
                                </p>
                            </div>
                            
                            {editingId === comment._id ? (
                                <div className="space-y-2">
                                    <Textarea 
                                        value={editBody} 
                                        onChange={(e) => setEditBody(e.target.value)}
                                        className="min-h-[80px]"
                                    />
                                    <div className="flex gap-2">
                                        <Button 
                                            size="sm" 
                                            onClick={() => onUpdate(comment._id)}
                                            disabled={isPending || !editBody.trim()}
                                        >
                                            <Check className="size-4 mr-1" />
                                            Save
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            onClick={onCancelEdit}
                                        >
                                            <X className="size-4 mr-1" />
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className='text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed '>{comment.body}</p>
                                    {/* Show edit/delete buttons only for authenticated users */}
                                    {!isLoading && isAuthenticated && (
                                        <div className="flex gap-2 pt-2">
                                            <Button 
                                                size="sm" 
                                                variant="ghost" 
                                                onClick={() => onStartEdit(comment)}
                                                className="h-8 px-2 text-muted-foreground hover:text-foreground"
                                            >
                                                <Pencil className="size-4 mr-1" />
                                                Edit
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="ghost" 
                                                onClick={() => onDelete(comment._id)}
                                                className="h-8 px-2 text-muted-foreground hover:text-destructive"
                                            >
                                                <Trash2 className="size-4 mr-1" />
                                                Delete
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </section>
        </CardContent>
            
    </Card>
  )
}

export default CommentSection
