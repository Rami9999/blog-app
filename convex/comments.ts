import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

export const getCommentsByPostId = query({
    args:{postId: v.id("posts")},
    handler:async (ctx,args)=>{
        const data = await ctx.db.query("comments")
        .filter((q)=>q.eq(q.field("postId"),args.postId))
        .order("desc")
        .collect();

        return data;
    }
});

export const createComment = mutation({
    args:{
        postId:v.id("posts"),
        body:v.string()
    },
    handler:async (ctx,args)=>{
        const user = await authComponent.safeGetAuthUser(ctx);

        if(!user){
            throw new ConvexError("Not Authenticated");
        }

        const comment = await ctx.db.insert("comments",{
            postId:args.postId,
            body:args.body,
            authorId:user._id,
            authorName:user.name
        });

        return comment;
    }
});

export const deleteComment = mutation({
    args:{commentId: v.id("comments")},
    handler:async (ctx, args)=>{
        const user = await authComponent.safeGetAuthUser(ctx);

        if(!user){
            throw new ConvexError("Not Authenticated");
        }

        const comment = await ctx.db.get(args.commentId);
        if(!comment){
            throw new ConvexError("Comment not found");
        }

        if(comment.authorId !== user._id){
            throw new ConvexError("Not authorized to delete this comment");
        }

        await ctx.db.delete(args.commentId);
    }
});

export const updateComment = mutation({
    args:{commentId: v.id("comments"), body: v.string()},
    handler:async (ctx, args)=>{
        const user = await authComponent.safeGetAuthUser(ctx);

        if(!user){
            throw new ConvexError("Not Authenticated");
        }

        const comment = await ctx.db.get(args.commentId);
        if(!comment){
            throw new ConvexError("Comment not found");
        }

        if(comment.authorId !== user._id){
            throw new ConvexError("Not authorized to update this comment");
        }

        await ctx.db.patch(args.commentId, {body: args.body});
    }
});