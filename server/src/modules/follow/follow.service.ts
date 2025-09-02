import { FollowModel } from '../../models/Follow';
import { UserModel } from '../../models/User';
import { AppError } from '../../utils/response';

// Follow user
export const followUser = async (followerId: string, followingId: string) => {
    // Check if trying to follow self
    if (followerId === followingId) {
        throw new AppError('BAD_REQUEST', 'Cannot follow yourself', 400);
    }

    // Check if user to follow exists
    const userToFollow = await UserModel.findById(followingId);
    if (!userToFollow) {
        throw new AppError('NOT_FOUND', 'User to follow not found', 404);
    }

    // Create follow relationship
    try {
        await FollowModel.create({
            follower: followerId,
            following: followingId
        });
    } catch (error: any) {
        // Handle duplicate key error
        if (error.code === 11000) {
            throw new AppError('BAD_REQUEST', 'Already following this user', 400);
        }
        throw error;
    }

    return true;
};

// Unfollow user
export const unfollowUser = async (followerId: string, followingId: string) => {
    const result = await FollowModel.deleteOne({
        follower: followerId,
        following: followingId
    });

    if (result.deletedCount === 0) {
        throw new AppError('NOT_FOUND', 'Follow relationship not found', 404);
    }

    return true;
};

// Get followers of a user
export const getFollowers = async (userId: string) => {
    return FollowModel.find({ following: userId })
        .populate('follower', 'name email avatarId')
        .sort({ createdAt: -1 });
};

// Get users that a user is following
export const getFollowing = async (userId: string) => {
    return FollowModel.find({ follower: userId })
        .populate('following', 'name email avatarId')
        .sort({ createdAt: -1 });
};

// Check if userA follows userB
export const checkFollowing = async (followerUserId: string, followingUserId: string) => {
    const follow = await FollowModel.findOne({
        follower: followerUserId,
        following: followingUserId
    });
    return !!follow;
};
