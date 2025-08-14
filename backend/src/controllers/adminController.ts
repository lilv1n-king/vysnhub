import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { AuthService } from '../services/authService';

export class AdminController {
  
  // Get all users for admin dashboard
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const { data: users, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          first_name,
          last_name,
          company_name,
          phone,
          email_verified,
          account_status,
          standard_discount,
          registration_code_used,
          admin_notes,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
          success: false,
          error: 'Database error',
          message: 'Failed to fetch users'
        });
        return;
      }

      // Map database status values back to frontend values
      const statusMapping: Record<string, string> = {
        'pending': 'pending',
        'active': 'approved',
        'inactive': 'rejected',
        'suspended': 'suspended'
      };

      const mappedUsers = users?.map(user => ({
        ...user,
        account_status: statusMapping[user.account_status] || user.account_status
      }));

      res.json({
        success: true,
        data: mappedUsers
      });

    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve users'
      });
    }
  }

  // Update user account status (approve/reject/suspend)
  async updateUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { account_status, admin_notes } = req.body;

      // Validate account status
      const validStatuses = ['pending', 'approved', 'rejected', 'suspended'];
      if (!validStatuses.includes(account_status)) {
        res.status(400).json({
          success: false,
          error: 'Invalid status',
          message: 'Account status must be one of: ' + validStatuses.join(', ')
        });
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          account_status,
          admin_notes: admin_notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select();

      if (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({
          success: false,
          error: 'Database error',
          message: 'Failed to update user status'
        });
        return;
      }

      if (!data || data.length === 0) {
        res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'User with specified ID does not exist'
        });
        return;
      }

      res.json({
        success: true,
        data: data[0],
        message: `User account status updated to ${account_status}`
      });

    } catch (error) {
      console.error('Update user status error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to update user status'
      });
    }
  }

  // Update user discount
  async updateUserDiscount(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { standard_discount } = req.body;

      // Validate discount (0-99.99%)
      if (typeof standard_discount !== 'number' || standard_discount < 0 || standard_discount >= 100) {
        res.status(400).json({
          success: false,
          error: 'Invalid discount',
          message: 'Discount must be a number between 0 and 99.99'
        });
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          standard_discount,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select();

      if (error) {
        console.error('Error updating user discount:', error);
        res.status(500).json({
          success: false,
          error: 'Database error',
          message: 'Failed to update user discount'
        });
        return;
      }

      if (!data || data.length === 0) {
        res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'User with specified ID does not exist'
        });
        return;
      }

      res.json({
        success: true,
        data: data[0],
        message: `User discount updated to ${standard_discount}%`
      });

    } catch (error) {
      console.error('Update user discount error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to update user discount'
      });
    }
  }

  // Get admin dashboard statistics
  async getDashboardStats(req: Request, res: Response): Promise<void> {
    try {
      // Get user counts by status
      const { data: statusCounts, error: statusError } = await supabase
        .from('profiles')
        .select('account_status')
        .neq('is_admin', true); // Exclude admin users from stats

      if (statusError) {
        console.error('Error fetching status counts:', statusError);
        res.status(500).json({
          success: false,
          error: 'Database error',
          message: 'Failed to fetch dashboard statistics'
        });
        return;
      }

      // Count users by status (using database values)
      const stats = {
        total_users: statusCounts?.length || 0,
        pending_users: statusCounts?.filter(u => u.account_status === 'pending').length || 0,
        approved_users: statusCounts?.filter(u => u.account_status === 'active').length || 0,
        rejected_users: statusCounts?.filter(u => u.account_status === 'inactive').length || 0,
        suspended_users: statusCounts?.filter(u => u.account_status === 'suspended').length || 0
      };

      // Get registration codes stats
      const { data: regCodes, error: regError } = await supabase
        .from('registration_codes')
        .select('code, current_uses, max_uses, is_active');

      if (!regError && regCodes) {
        stats.total_reg_codes = regCodes.length;
        stats.active_reg_codes = regCodes.filter(c => c.is_active).length;
      }

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve dashboard statistics'
      });
    }
  }

  // Update user (combined status and discount update)
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { account_status, standard_discount, admin_notes } = req.body;

      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      // Validate and add account status if provided
      if (account_status !== undefined) {
        const statusMapping: Record<string, string> = {
          'pending': 'pending',
          'approved': 'active',
          'rejected': 'inactive',
          'suspended': 'suspended'
        };
        
        const validFrontendStatuses = Object.keys(statusMapping);
        if (!validFrontendStatuses.includes(account_status)) {
          res.status(400).json({
            success: false,
            error: 'Invalid status',
            message: 'Account status must be one of: ' + validFrontendStatuses.join(', ')
          });
          return;
        }
        updateData.account_status = statusMapping[account_status];
      }

      // Validate and add discount if provided
      if (standard_discount !== undefined) {
        if (typeof standard_discount !== 'number' || standard_discount < 0 || standard_discount >= 100) {
          res.status(400).json({
            success: false,
            error: 'Invalid discount',
            message: 'Discount must be a number between 0 and 99.99'
          });
          return;
        }
        updateData.standard_discount = standard_discount;
      }

      // Add admin notes if provided
      if (admin_notes !== undefined) {
        updateData.admin_notes = admin_notes;
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select();

      if (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
          success: false,
          error: 'Database error',
          message: 'Failed to update user'
        });
        return;
      }

      if (!data || data.length === 0) {
        res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'User with specified ID does not exist'
        });
        return;
      }

      res.json({
        success: true,
        data: data[0],
        message: 'User updated successfully'
      });

    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to update user'
      });
    }
  }

  // Create new user with admin privileges
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const {
        email,
        password,
        first_name,
        last_name,
        company_name,
        phone,
        account_status = 'approved',
        standard_discount = 0,
        admin_notes,
        is_admin = false
      } = req.body;

      // Validate required fields
      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'Email and password are required'
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          error: 'Invalid email',
          message: 'Please provide a valid email address'
        });
        return;
      }

      // Validate password strength
      if (password.length < 6) {
        res.status(400).json({
          success: false,
          error: 'Weak password',
          message: 'Password must be at least 6 characters long'
        });
        return;
      }

      // Validate discount
      if (typeof standard_discount !== 'number' || standard_discount < 0 || standard_discount >= 100) {
        res.status(400).json({
          success: false,
          error: 'Invalid discount',
          message: 'Discount must be a number between 0 and 99.99'
        });
        return;
      }

      // Validate account status - map frontend values to database values
      const statusMapping: Record<string, string> = {
        'pending': 'pending',
        'approved': 'active',  // Map approved to active
        'rejected': 'inactive', // Map rejected to inactive  
        'suspended': 'suspended'
      };
      
      const validFrontendStatuses = Object.keys(statusMapping);
      if (!validFrontendStatuses.includes(account_status)) {
        res.status(400).json({
          success: false,
          error: 'Invalid status',
          message: 'Account status must be one of: ' + validFrontendStatuses.join(', ')
        });
        return;
      }
      
      const dbAccountStatus = statusMapping[account_status];

      // Create AuthService instance for this operation
      const authService = new AuthService();

      // Create user in Supabase Auth using admin client
      const { data: authData, error: authError } = await authService.getAdminClient().auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          first_name: first_name || '',
          last_name: last_name || '',
          company_name: company_name || ''
        }
      });

      if (authError || !authData.user) {
        console.error('Auth user creation error:', authError);
        res.status(500).json({
          success: false,
          error: 'Failed to create auth user',
          message: authError?.message || 'Unknown error during user creation'
        });
        return;
      }

      // Create profile in profiles table
      const { data: profileData, error: profileError } = await authService.getAdminClient()
        .from('profiles')
        .insert({
          id: authData.user.id,
          email,
          first_name: first_name || '',
          last_name: last_name || '',
          company_name: company_name || '',
          phone: phone || '',
          account_status: dbAccountStatus,
          standard_discount,
          admin_notes: admin_notes || '',
          is_admin,
          email_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        
        // Cleanup: Delete the auth user if profile creation failed
        await authService.getAdminClient().auth.admin.deleteUser(authData.user.id);
        
        res.status(500).json({
          success: false,
          error: 'Failed to create user profile',
          message: profileError.message || 'Unknown error during profile creation'
        });
        return;
      }

      console.log(`✅ Admin created new user: ${email} (ID: ${authData.user.id})`);

      res.status(201).json({
        success: true,
        data: profileData,
        message: `User ${email} created successfully`
      });

    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to create user'
      });
    }
  }
}