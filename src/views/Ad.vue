<template>
  <div class="ad-container">
    <div class="ad-header">
      <h2>广告展示</h2>
      <div class="controls">
        <el-switch
          v-model="autoPlay"
          active-text="自动播放"
          inactive-text="手动控制">
        </el-switch>
        <el-button-group v-if="!autoPlay">
          <el-button type="primary" icon="el-icon-arrow-left" @click="prevAd" :disabled="currentIndex <= 0">上一个</el-button>
          <el-button type="primary" @click="nextAd" :disabled="currentIndex >= ads.length - 1">下一个<i class="el-icon-arrow-right el-icon--right"></i></el-button>
        </el-button-group>
      </div>
    </div>
    
    <div class="ad-content">
      <div class="carousel-container">
        <el-carousel
          ref="carousel"
          height="100%"
          :autoplay="autoPlay"
          :interval="carouselInterval"
          arrow="always"
          indicator-position="outside">
          <el-carousel-item v-for="(ad, index) in ads" :key="index">
            <div class="ad-item" :style="{ backgroundColor: ad.backgroundColor }">
              <div class="ad-image" v-if="ad.imageUrl">
                <img :src="ad.imageUrl" :alt="ad.title">
              </div>
              <div class="ad-info">
                <h3>{{ ad.title }}</h3>
                <p>{{ ad.description }}</p>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>
    </div>
    
    <div class="settings-panel">
      <h3>广告设置</h3>
      <div class="settings-form">
        <div class="form-item">
          <label>自动播放间隔 (秒)</label>
          <el-slider v-model="carouselInterval" :min="2000" :max="10000" :step="1000" :format-tooltip="formatTooltip"></el-slider>
        </div>
        
        <div class="form-item">
          <el-button type="primary" @click="openAdManager">广告管理</el-button>
        </div>
      </div>
      
      <el-dialog
        title="广告管理"
        :visible.sync="adManagerVisible"
        width="70%">
        <div class="ad-manager">
          <div class="ad-list">
            <el-table
              :data="ads"
              style="width: 100%">
              <el-table-column
                prop="title"
                label="标题"
                width="180">
              </el-table-column>
              <el-table-column
                prop="description"
                label="描述">
              </el-table-column>
              <el-table-column
                label="操作"
                width="150">
                <template slot-scope="scope">
                  <el-button
                    size="mini"
                    @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                  <el-button
                    size="mini"
                    type="danger"
                    @click="handleDelete(scope.$index, scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <div class="add-ad">
              <el-button type="primary" @click="addNewAd">添加广告</el-button>
            </div>
          </div>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="adManagerVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveAds">保 存</el-button>
        </span>
      </el-dialog>
      
      <el-dialog
        :title="editingAd ? '编辑广告' : '添加广告'"
        :visible.sync="adEditorVisible"
        width="50%">
        <div class="ad-editor">
          <el-form :model="currentAd" label-width="80px">
            <el-form-item label="标题">
              <el-input v-model="currentAd.title"></el-input>
            </el-form-item>
            <el-form-item label="描述">
              <el-input type="textarea" v-model="currentAd.description" rows="4"></el-input>
            </el-form-item>
            <el-form-item label="背景色">
              <el-color-picker v-model="currentAd.backgroundColor"></el-color-picker>
            </el-form-item>
            <el-form-item label="图片URL">
              <el-input v-model="currentAd.imageUrl"></el-input>
            </el-form-item>
          </el-form>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="adEditorVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveCurrentAd">保 存</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Ad',
  data() {
    return {
      autoPlay: true,
      carouselInterval: 5000,
      currentIndex: 0,
      ads: [
        {
          title: '银行服务宣传',
          description: '我们提供全方位的金融服务，满足您的各种需求',
          backgroundColor: '#f0f9eb',
          imageUrl: 'https://via.placeholder.com/800x400?text=Banking+Services'
        },
        {
          title: '个人理财产品',
          description: '稳健投资，收益保障，为您的财富保驾护航',
          backgroundColor: '#f0f2f5',
          imageUrl: 'https://via.placeholder.com/800x400?text=Financial+Products'
        },
        {
          title: '企业贷款优惠',
          description: '低息贷款，快速审批，助力企业发展',
          backgroundColor: '#ecf5ff',
          imageUrl: 'https://via.placeholder.com/800x400?text=Business+Loans'
        }
      ],
      adManagerVisible: false,
      adEditorVisible: false,
      editingAd: null,
      currentAd: {
        title: '',
        description: '',
        backgroundColor: '#ffffff',
        imageUrl: ''
      }
    }
  },
  created() {
    // 从本地存储加载广告数据
    const savedAds = this.$getLocal('ad_list');
    if (savedAds) {
      this.ads = savedAds;
    }
    
    // 从本地存储加载设置
    const settings = this.$getLocal('ad_settings');
    if (settings) {
      this.autoPlay = settings.autoPlay;
      this.carouselInterval = settings.carouselInterval;
    }
  },
  methods: {
    // 上一个广告
    prevAd() {
      this.$refs.carousel.prev();
    },
    
    // 下一个广告
    nextAd() {
      this.$refs.carousel.next();
    },
    
    // 格式化提示文本
    formatTooltip(val) {
      return val / 1000 + '秒';
    },
    
    // 打开广告管理器
    openAdManager() {
      this.adManagerVisible = true;
    },
    
    // 保存广告列表
    saveAds() {
      this.$setLocal('ad_list', this.ads);
      this.$setLocal('ad_settings', {
        autoPlay: this.autoPlay,
        carouselInterval: this.carouselInterval
      });
      this.adManagerVisible = false;
      this.$message.success('广告设置已保存');
    },
    
    // 添加新广告
    addNewAd() {
      this.editingAd = null;
      this.currentAd = {
        title: '',
        description: '',
        backgroundColor: '#ffffff',
        imageUrl: ''
      };
      this.adEditorVisible = true;
    },
    
    // 编辑广告
    handleEdit(index, row) {
      this.editingAd = index;
      this.currentAd = JSON.parse(JSON.stringify(row));
      this.adEditorVisible = true;
    },
    
    // 删除广告
    handleDelete(index, row) {
      this.$confirm('确认删除该广告?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.ads.splice(index, 1);
        this.$message({
          type: 'success',
          message: '删除成功!'
        });
      }).catch(() => {
        // 用户取消删除
      });
    },
    
    // 保存当前编辑的广告
    saveCurrentAd() {
      if (this.editingAd !== null) {
        // 更新现有广告
        this.ads.splice(this.editingAd, 1, this.currentAd);
      } else {
        // 添加新广告
        this.ads.push(this.currentAd);
      }
      
      this.adEditorVisible = false;
    }
  }
}
</script>

<style scoped>
.ad-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.ad-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid #ddd;
  background-color: #fff;
}

.ad-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.carousel-container {
  height: 100%;
}

.ad-item {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.ad-image {
  max-width: 80%;
  max-height: 70%;
  margin-bottom: 20px;
}

.ad-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.ad-info {
  text-align: center;
  max-width: 80%;
}

.ad-info h3 {
  font-size: 28px;
  margin-bottom: 15px;
}

.ad-info p {
  font-size: 18px;
  line-height: 1.5;
}

.settings-panel {
  position: fixed;
  right: 0;
  bottom: 0;
  width: 300px;
  background-color: #fff;
  border-top-left-radius: 8px;
  box-shadow: -2px -2px 10px rgba(0, 0, 0, 0.1);
  padding: 15px;
  transform: translateY(calc(100% - 50px));
  transition: transform 0.3s;
}

.settings-panel:hover {
  transform: translateY(0);
}

.settings-panel h3 {
  margin-top: 0;
  margin-bottom: 15px;
  cursor: pointer;
}

.settings-form {
  padding-top: 10px;
}

.form-item {
  margin-bottom: 15px;
}

.form-item label {
  display: block;
  margin-bottom: 5px;
}

.ad-manager {
  max-height: 500px;
  overflow-y: auto;
}

.add-ad {
  margin-top: 15px;
  text-align: center;
}

/* 媒体查询，适配不同屏幕 */
@media (max-width: 768px) {
  .settings-panel {
    width: 100%;
    border-radius: 0;
  }
  
  .ad-info h3 {
    font-size: 24px;
  }
  
  .ad-info p {
    font-size: 16px;
  }
}
</style> 