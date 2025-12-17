import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // ⚠️ 重要：这里必须填 '/你的仓库名/'
  // 如果你在GitHub创建的仓库叫 birthday-gift，这里就填 '/birthday-gift/'
  // 如果你还没确定名字，或者部署后发现白屏/资源丢失，请回来修改这一行
  base: '/birthday-gift/', 
  build: {
    outDir: 'dist',
  }
})