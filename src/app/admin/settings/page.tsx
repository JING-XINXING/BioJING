import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const settings = await prisma.siteSetting.findMany();
  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  async function updateSetting(formData: FormData) {
    'use server';
    const key = formData.get('key') as string;
    const value = formData.get('value') as string;
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    revalidatePath('/admin/settings');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">站点设置</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">基本信息</h3>
          <form action={updateSetting} className="space-y-3">
            <div>
              <label className="text-xs text-gray-500">站点名称</label>
              <input name="key" type="hidden" value="site_name" />
              <input name="value" defaultValue={settingsMap.site_name || 'BioJING'} className="input-field text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs text-gray-500">站点描述</label>
              <textarea name="key" value="site_description" className="hidden" readOnly />
              <textarea name="value" defaultValue={settingsMap.site_description || ''} className="input-field text-sm mt-1" rows={3} />
            </div>
            <button type="submit" className="btn-primary text-sm">保存</button>
          </form>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">联系方式</h3>
          <form action={updateSetting} className="space-y-3">
            <div>
              <label className="text-xs text-gray-500">邮箱</label>
              <input name="key" type="hidden" value="contact_email" />
              <input name="value" defaultValue={settingsMap.contact_email || ''} className="input-field text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs text-gray-500">微信公众号</label>
              <input name="key" type="hidden" value="wechat" />
              <input name="value" defaultValue={settingsMap.wechat || ''} className="input-field text-sm mt-1" />
            </div>
            <button type="submit" className="btn-primary text-sm">保存</button>
          </form>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">安全设置</h3>
          <form action={updateSetting} className="space-y-3">
            <div>
              <label className="text-xs text-gray-500">管理密码</label>
              <input name="key" type="hidden" value="admin_password" />
              <input name="value" type="password" defaultValue={settingsMap.admin_password || ''} className="input-field text-sm mt-1" />
            </div>
            <button type="submit" className="btn-primary text-sm">更新密码</button>
          </form>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">SEO 设置</h3>
          <form action={updateSetting} className="space-y-3">
            <div>
              <label className="text-xs text-gray-500">首页关键词（逗号分隔）</label>
              <input name="key" type="hidden" value="keywords" />
              <input name="value" defaultValue={settingsMap.keywords || '生物信息学,生信,转录组,单细胞'} className="input-field text-sm mt-1" />
            </div>
            <button type="submit" className="btn-primary text-sm">保存</button>
          </form>
        </div>
      </div>
    </div>
  );
}
