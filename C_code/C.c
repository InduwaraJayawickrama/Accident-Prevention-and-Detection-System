#include <stdio.h>
#include <string.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/gpio.h"
#include "driver/i2c.h"
#include "driver/spi_master.h"
#include "esp_log.h"
#include "esp_wifi.h"
#include "nvs_flash.h"

// GPIO Pins
#define BUZZER_PIN 14
#define TRIG_PIN 13
#define ECHO_PIN 12
#define FIRE_SENSOR_PIN 32

// MPU6050 I2C Address
#define MPU6050_ADDR 0x68

// OLED Display SPI Pins
#define OLED_MOSI 23
#define OLED_CLK 18
#define OLED_DC 5
#define OLED_CS 15
#define OLED_RESET 4

// I2C Configuration
#define I2C_MASTER_SCL_IO 22
#define I2C_MASTER_SDA_IO 21
#define I2C_MASTER_FREQ_HZ 100000

static const char *TAG = "MAIN";

// Function Prototypes
void setup_buzzer();
void buzzer_on();
void buzzer_off();
void setup_i2c();
esp_err_t mpu6050_read(uint8_t reg, uint8_t *data, size_t len);
float get_tilt_angle();
void setup_oled();
void oled_display_text(const char *text);

// Setup Buzzer
void setup_buzzer() {
    gpio_config_t io_conf;
    io_conf.intr_type = GPIO_INTR_DISABLE;
    io_conf.mode = GPIO_MODE_OUTPUT;
    io_conf.pin_bit_mask = (1ULL << BUZZER_PIN);
    io_conf.pull_down_en = 0;
    io_conf.pull_up_en = 0;
    gpio_config(&io_conf);
}

void buzzer_on() {
    gpio_set_level(BUZZER_PIN, 1);
}

void buzzer_off() {
    gpio_set_level(BUZZER_PIN, 0);
}

// Setup I2C
void setup_i2c() {
    i2c_config_t conf = {
        .mode = I2C_MODE_MASTER,
        .sda_io_num = I2C_MASTER_SDA_IO,
        .scl_io_num = I2C_MASTER_SCL_IO,
        .sda_pullup_en = GPIO_PULLUP_ENABLE,
        .scl_pullup_en = GPIO_PULLUP_ENABLE,
        .master.clk_speed = I2C_MASTER_FREQ_HZ,
    };
    i2c_param_config(I2C_NUM_0, &conf);
    i2c_driver_install(I2C_NUM_0, conf.mode, 0, 0, 0);
}

// Read MPU6050 Register
esp_err_t mpu6050_read(uint8_t reg, uint8_t *data, size_t len) {
    i2c_cmd_handle_t cmd = i2c_cmd_link_create();
    i2c_master_start(cmd);
    i2c_master_write_byte(cmd, (MPU6050_ADDR << 1) | I2C_MASTER_WRITE, true);
    i2c_master_write_byte(cmd, reg, true);
    i2c_master_start(cmd);
    i2c_master_write_byte(cmd, (MPU6050_ADDR << 1) | I2C_MASTER_READ, true);
    if (len > 1) {
        i2c_master_read(cmd, data, len - 1, I2C_MASTER_ACK);
    }
    i2c_master_read_byte(cmd, data + len - 1, I2C_MASTER_NACK);
    i2c_master_stop(cmd);
    esp_err_t ret = i2c_master_cmd_begin(I2C_NUM_0, cmd, 1000 / portTICK_PERIOD_MS);
    i2c_cmd_link_delete(cmd);
    return ret;
}

// Get Tilt Angle from MPU6050
float get_tilt_angle() {
    uint8_t data[6];
    mpu6050_read(0x3B, data, 6); // Read accelerometer data
    int16_t ax = (data[0] << 8) | data[1];
    int16_t ay = (data[2] << 8) | data[3];
    int16_t az = (data[4] << 8) | data[5];

    float x = ax / 16384.0;
    float y = ay / 16384.0;
    float z = az / 16384.0;

    float angle = atan2(y, sqrt(x * x + z * z)) * 180 / 3.14159265;
    return angle;
}

// Setup OLED Display
void setup_oled() {
    spi_bus_config_t buscfg = {
        .miso_io_num = -1,
        .mosi_io_num = OLED_MOSI,
        .sclk_io_num = OLED_CLK,
        .quadwp_io_num = -1,
        .quadhd_io_num = -1,
    };
    spi_device_interface_config_t devcfg = {
        .clock_speed_hz = 1000000,
        .mode = 0,
        .spics_io_num = OLED_CS,
        .queue_size = 7,
    };
    spi_bus_initialize(SPI2_HOST, &buscfg, SPI_DMA_CH_AUTO);
    spi_device_handle_t spi;
    spi_bus_add_device(SPI2_HOST, &devcfg, &spi);

    // Initialize OLED (commands omitted for brevity)
}

// Display Text on OLED
void oled_display_text(const char *text) {
    // Implement OLED text rendering here
}

// Main Task
void app_main() {
    // Initialize NVS
    esp_err_t ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_init();
    }
    ESP_ERROR_CHECK(ret);

    // Initialize Peripherals
    setup_buzzer();
    setup_i2c();
    setup_oled();

    while (1) {
        float tilt_angle = get_tilt_angle();
        ESP_LOGI(TAG, "Tilt Angle: %.2f", tilt_angle);

        if (tilt_angle >= 45) {
            buzzer_on();
            oled_display_text("High Tilt Alert!");
        } else {
            buzzer_off();
            oled_display_text("Safe Zone");
        }

        vTaskDelay(500 / portTICK_PERIOD_MS);
    }
}