
import React, { useState } from 'react';
import { SocialPost } from '../types';
import HeartIcon from './icons/HeartIcon';
import CommentIcon from './icons/CommentIcon';
import ShareIcon from './icons/ShareIcon';
import SparklesIcon from './icons/SparklesIcon';
import { currentUser } from '../constants';
import ShareModal from './ShareModal';

interface SocialFeedProps {
  posts: SocialPost[];
  onShareOutfit: (post: Omit<SocialPost, 'id' | 'likes' | 'comments'>) => void;
}

const SocialFeed: React.FC<SocialFeedProps> = ({ posts, onShareOutfit }) => {
  const [postToShare, setPostToShare] = useState<SocialPost | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const handleLike = (postId: string) => {
      setLikedPosts(prev => {
          const next = new Set(prev);
          if (next.has(postId)) next.delete(postId);
          else next.add(postId);
          return next;
      });
  };

  const handleConfirmShare = (caption: string) => {
    if (!postToShare) return;
    onShareOutfit({
      user: currentUser,
      caption: caption,
      outfitImageUrl: postToShare.outfitImageUrl,
      videoUrl: postToShare.videoUrl,
    });
    setPostToShare(null);
  };
  
  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20" dir="rtl">
      {/* Trending Header */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-purple-600" />
                  أبرز الستايلات اليوم
              </h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {['#صيف_2025', '#كاجوال_شيك', '#رسمي', '#تنسيقات_مصر'].map((tag) => (
                  <button key={tag} className="flex-shrink-0 bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-bold border border-purple-100 hover:bg-purple-100 transition-colors">
                      {tag}
                  </button>
              ))}
          </div>
      </div>

      {posts.map((post) => {
        const isLiked = likedPosts.has(post.id);
        return (
          <div key={post.id} className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-50 group transition-all hover:shadow-2xl">
            {/* Post Header */}
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                    <img src={post.user.avatarUrl} alt={post.user.name} className="w-12 h-12 rounded-full border-2 border-purple-100 p-0.5" />
                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <p className="font-black text-gray-900 text-base">{post.user.name}</p>
                  <p className="text-xs text-gray-400 font-medium">منذ ساعتين</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600 p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
              </button>
            </div>

            {/* Post Media */}
            <div className="relative aspect-[4/5] bg-gray-50">
                {post.videoUrl ? (
                    <video src={post.videoUrl} controls loop playsInline className="w-full h-full object-cover" />
                ) : post.outfitImageUrl ? (
                    <img src={post.outfitImageUrl} alt="Outfit" className="w-full h-full object-cover" />
                ) : null}
                
                {/* AI Verified Badge */}
                <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm border border-white/50">
                    <div className="bg-purple-600 rounded-full p-0.5">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <span className="text-[10px] font-black text-purple-900 uppercase tracking-wider">AI Verified Fit</span>
                </div>
            </div>
            
            {/* Post Actions */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-6">
                    <button 
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-2 transition-all transform active:scale-125 ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                    >
                        <HeartIcon className={`w-7 h-7 ${isLiked ? 'fill-current' : ''}`} />
                        <span className="font-black text-lg">{post.likes + (isLiked ? 1 : 0)}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-400 hover:text-blue-500 transition-colors">
                        <CommentIcon className="w-7 h-7" />
                        <span className="font-black text-lg">{post.comments.length}</span>
                    </button>
                  </div>
                  <button 
                    onClick={() => setPostToShare(post)}
                    className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-green-500 hover:bg-green-50 transition-all"
                  >
                    <ShareIcon className="w-6 h-6" />
                  </button>
              </div>
              
              <div className="space-y-2">
                <p className="text-gray-800 leading-relaxed">
                  <span className="font-black ml-2 text-gray-900">{post.user.name}</span>
                  {post.caption}
                </p>
                <div className="flex gap-2">
                    {['#StyleFit', '#AI_Fashion'].map(tag => (
                        <span key={tag} className="text-purple-600 font-bold text-sm">{tag}</span>
                    ))}
                </div>
              </div>

              {/* Comments Preview */}
              <div className="mt-6 pt-6 border-t border-gray-50 space-y-3">
                {post.comments.slice(0, 1).map(comment => (
                     <div key={comment.id} className="flex gap-2 text-sm bg-gray-50/50 p-3 rounded-2xl">
                        <span className="font-black text-gray-900 flex-shrink-0">{comment.user.name}</span>
                        <span className="text-gray-600">{comment.text}</span>
                     </div>
                ))}
                {post.comments.length > 1 && (
                    <button className="text-gray-400 text-xs font-bold mr-3 hover:text-purple-600">
                        عرض جميع التعليقات ({post.comments.length})
                    </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
      
      {postToShare && (
        <ShareModal 
          imageUrl={postToShare.outfitImageUrl}
          videoUrl={postToShare.videoUrl}
          initialCaption={`تنسيق رائع من StyleFit! مستوحى من @${postToShare.user.name}.`}
          onClose={() => setPostToShare(null)}
          onShare={handleConfirmShare}
        />
      )}
    </div>
  );
};

export default SocialFeed;
