import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { authComponent } from "./auth";

export const createPost = mutation({
    args:{title:v.string(),body:v.string(),imageStorageId:v.id("_storage")},
    handler: async (ctx,args) => {
        const user = await authComponent.safeGetAuthUser(ctx);
        
        if(!user)
            throw new ConvexError("Not Authenticated!");

        const blogArticle = await ctx.db.insert('posts',{
            title:args.title,
            body:args.body,
            authorId:user._id,
            imageStorageId:args.imageStorageId
        })

        return blogArticle;
    }
});

export const getPosts = query({
    args:{},
    handler: async (ctx)=>{
        const posts = await ctx.db.query('posts').order('desc').collect();

        return await Promise.all(
            posts.map(async (post)=>{
                const resolvedImageUrl = post.imageStorageId !== undefined ? await ctx.storage.getUrl(post.imageStorageId):null;
                return {
                    ...post,
                    imageUrl:resolvedImageUrl
                }
            })
        )
    }
})

export const generateImageUploadUrl = mutation({
    args:{},
    handler:async(ctx)=>{
        const user = await authComponent.safeGetAuthUser(ctx);
        
        if(!user)
            throw new ConvexError("Not Authenticated!");

        return await ctx.storage.generateUploadUrl();
    }
});

export const getPostById = query({
    args:{postId:v.id("posts")},
    handler:async(ctx,args)=>{
        const post = await ctx.db.get('posts',args.postId);
        const resolvedImageUrl = post?.imageStorageId ? await ctx.storage.getUrl(post.imageStorageId):null;


        if(!post){
            throw null;
        }

        return {
            ...post,
            imageUrl:resolvedImageUrl
        };
    },
});

export const getUserPostsCount = query({
    args:{},
    handler:async(ctx)=>{
        const user = await authComponent.safeGetAuthUser(ctx);
        
        if(!user){
            return 0;
        }

        const posts = await ctx.db.query('posts')
            .filter((q)=>q.eq(q.field('authorId'),user._id))
            .collect();

        return posts.length;
    }
});

export const getUserProfile = query({
    args:{},
    handler:async(ctx)=>{
        const user = await authComponent.safeGetAuthUser(ctx);
        
        if(!user){
            return null;
        }

        return {
            id: user._id,
            name: user.name,
            email: user.email,
            image: user.image,
        };
    }
});

export const deleteUserData = mutation({
    args:{},
    handler:async(ctx)=>{
        const user = await authComponent.safeGetAuthUser(ctx);
        
        if(!user){
            throw new ConvexError("Not Authenticated!");
        }

        const userId = user._id;

        // Delete all posts by this user
        const posts = await ctx.db.query('posts')
            .filter((q)=>q.eq(q.field('authorId'),userId))
            .collect();
        
        for (const post of posts) {
            await ctx.db.delete(post._id);
        }

        // Delete all comments by this user
        const comments = await ctx.db.query('comments')
            .filter((q)=>q.eq(q.field('authorId'),userId))
            .collect();
        
        for (const comment of comments) {
            await ctx.db.delete(comment._id);
        }

        return { success: true };
    }
});