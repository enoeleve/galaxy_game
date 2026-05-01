{-# LANGUAGE OverloadedStrings #-}

module Main where

import Web.Scotty

main :: IO ()
main = do
  putStrLn "revival-backend listening on http://localhost:3001"
  scotty 3001 $ do
    get "/health" $
      json ("ok" :: String)

    get "/api/assets/versions" $
      json
        [ "441",
          "481",
          "501",
          "541"
        ]
