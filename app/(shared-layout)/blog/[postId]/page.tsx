import { commentSchema } from "@/app/schemas/comment"
import { buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import CommentSection from "@/components/web/commentSection"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { getPostById } from "@/convex/posts"
import { zodResolver } from "@hookform/resolvers/zod"
import { fetchQuery, preloadQuery } from "convex/nextjs"
import { isAuthenticated } from "@/lib/auth-server"
import { redirect } from "next/navigation"
import { ArrowLeft, Ghost } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface PostIdRouteProps{
    params: Promise<{
        postId:Id<'posts'>
    }>
}

// Remove static caching to allow dynamic auth checks
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function checkAuth() {
  const auth = await isAuthenticated();
  if (!auth) {
    redirect('/auth/login?callbackUrl=/blog');
  }
}

async function PostIdRoute({params}:PostIdRouteProps) {
    await checkAuth();

    const {postId} = await params;

    const [post,preLoadedCommnets] = await Promise.all([
        await fetchQuery(api.posts.getPostById,{postId}),
        await preloadQuery(api.comments.getCommentsByPostId,{postId})
    ]);

    if(!post){
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <Ghost className="size-16 text-muted-foreground"/>
                <h1 className="text-2xl font-bold mt-4">Post Not Found</h1>
                <p className="text-muted-foreground mt-2">The post you are looking for does not exist.</p>
                <Link className={buttonVariants({ variant: "ghost", className:"mt-6" })} href={"/blog"}>
                    <ArrowLeft className="size-4" />
                    Back to Blog
                </Link>
            </div>
        )
    }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-in fade-in duration-500 relative">
        <Link className={buttonVariants({ variant: "outline" ,className:'mb-4'})} href={"/blog"}>
            <ArrowLeft className="size-4" />
            Back to Blog
        </Link>

        <div className="relative w-full h-[400px] mb-8 rounded-xl overflow-hidden shadow-sm">
            <Image 
                src={post.imageUrl ?? 'https://images.unsplash.com/photo-1769109002468-85f8a39d5ccd?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'} 
                alt={post.title ?? "Blog image not found"}
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
            />
        </div>

        <div className="space-y-4 flex flex-col">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">{post.title}</h1>
            <p className="text-sm text-muted-foreground">Posted on: {new Date(post._creationTime).toLocaleDateString("en-US")}</p>
        </div>

        <Separator  className="my-8"/>

        <p className="text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">
            {post.body}
        </p>

        <Separator  className="my-8"/>

        <CommentSection preLoadedCommnets={preLoadedCommnets}/>

    </div>

  )
}

export default PostIdRoute
