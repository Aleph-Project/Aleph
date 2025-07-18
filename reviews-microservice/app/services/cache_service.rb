require 'redis'

class CacheService
  def initialize
    @redis = Redis.new(
      host: ENV['REDIS_HOST'],
      port: ENV['REDIS_PORT'],
      password: ENV['REDIS_PASSWORD']
    )
    @ttl = ENV.fetch('CACHE_TTL_SECONDS', 300).to_i
  end

  def fetch(key)
    value = @redis.get(key)
    if value
      Rails.logger.info("[CACHE] HIT for #{key}")
      JSON.parse(value)
    else
      Rails.logger.info("[CACHE] MISS for #{key}")
      nil
    end
  end

  def write(key, value)
    @redis.set(key, value.to_json, ex: @ttl)
  end

  def delete(key)
    @redis.del(key)
  end
end