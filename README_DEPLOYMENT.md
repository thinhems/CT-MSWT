# Hướng dẫn Deploy lên Vercel

## 🚀 Bước 1: Chuẩn bị

### 1.1. Đảm bảo code đã sẵn sàng
- ✅ Tất cả TypeScript errors đã được fix
- ✅ Build thành công: `npm run build`
- ✅ Code đã được commit và push lên GitHub

### 1.2. Kiểm tra cấu hình
- ✅ `vercel.json` đã được cấu hình đúng
- ✅ `package.json` có script build: `"build": "vite build"`
- ✅ `.gitignore` đã loại trừ `node_modules`, `dist`, `.vercel`

## 🚀 Bước 2: Deploy lên Vercel

### Cách 1: Deploy qua Vercel Dashboard (Khuyến nghị)

1. **Truy cập Vercel Dashboard**
   - Vào [vercel.com](https://vercel.com)
   - Đăng nhập bằng GitHub account

2. **Import Project**
   - Click "New Project"
   - Chọn repository từ GitHub
   - Vercel sẽ tự động detect đây là Vite project

3. **Cấu hình Build Settings**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Environment Variables (nếu cần)**
   - Thêm các biến môi trường nếu cần
   - Ví dụ: `NODE_ENV=production`

5. **Deploy**
   - Click "Deploy"
   - Chờ build hoàn thành

### Cách 2: Deploy qua Vercel CLI

1. **Cài đặt Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login vào Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Deploy production**
   ```bash
   vercel --prod
   ```

## 🚀 Bước 3: Kiểm tra sau khi deploy

### 3.1. Kiểm tra build logs
- Vào Vercel Dashboard > Project > Deployments
- Kiểm tra build logs có lỗi không

### 3.2. Kiểm tra ứng dụng
- Truy cập URL được cung cấp
- Test các chức năng chính:
  - ✅ Login/Register
  - ✅ Navigation
  - ✅ API calls
  - ✅ Responsive design

### 3.3. Kiểm tra API
- Đảm bảo API calls đến backend hoạt động
- Kiểm tra CORS settings
- Test authentication flow

## 🚀 Bước 4: Cấu hình Domain (Tùy chọn)

1. **Custom Domain**
   - Vào Project Settings > Domains
   - Thêm custom domain nếu có

2. **Environment Variables**
   - Cấu hình các biến môi trường cho production
   - Ví dụ: API URLs, API keys

## 🚀 Bước 5: Continuous Deployment

### 5.1. Auto Deploy
- Mỗi khi push code lên `main` branch
- Vercel sẽ tự động deploy

### 5.2. Preview Deployments
- Mỗi pull request sẽ tạo preview deployment
- Test trước khi merge

## 🔧 Troubleshooting

### Lỗi thường gặp:

1. **Build Failed - "vite: command not found"**
   ```bash
   # Kiểm tra build locally
   npm install
   npm run build
   npm run type-check
   ```
   
   **Giải pháp:**
   - Đảm bảo `vite` và `@vitejs/plugin-react` ở trong `dependencies`
   - Kiểm tra file `.npmrc` có `production=false`
   - Trong Vercel Dashboard, đảm bảo "Install Command" là `npm install --production=false`

2. **API Errors**
   - Kiểm tra CORS settings
   - Đảm bảo backend URL đúng
   - Test API endpoints

3. **Environment Variables**
   - Kiểm tra biến môi trường trong Vercel Dashboard
   - Đảm bảo format đúng

4. **Routing Issues**
   - Kiểm tra `vercel.json` rewrites
   - Đảm bảo SPA routing hoạt động

## 📝 Notes

- **Backend URL**: `https://capstoneproject-mswt-su25.onrender.com/api`
- **Frontend**: Deployed trên Vercel
- **Database**: MongoDB (hosted trên backend)
- **Authentication**: JWT tokens

## 🎯 Kết quả mong đợi

Sau khi deploy thành công:
- ✅ Ứng dụng hoạt động trên Vercel
- ✅ API calls hoạt động bình thường
- ✅ Authentication flow hoạt động
- ✅ Responsive design trên mobile
- ✅ Auto-deploy khi push code 